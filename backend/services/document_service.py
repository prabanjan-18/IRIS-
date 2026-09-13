import io
import re
from typing import Dict, Any, Optional
import pypdf
import docx

class DocumentService:
    """Service to parse, extract, and structure text from medical lab documents, PDFs, and clinical reports."""

    MAX_CHAR_LIMIT = 25000  # Cap extracted text to avoid overflowing LLM context

    @classmethod
    def extract_text(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        filename_lower = filename.lower()
        extracted_text = ""
        page_count = 1
        file_type = "Document"

        if filename_lower.endswith(".pdf"):
            file_type = "PDF Medical Document"
            extracted_text, page_count = cls._extract_from_pdf(file_bytes)
        elif filename_lower.endswith(".docx"):
            file_type = "Word Document (DOCX)"
            extracted_text, page_count = cls._extract_from_docx(file_bytes)
        elif filename_lower.endswith(".doc"):
            file_type = "Word Document (DOC)"
            extracted_text, page_count = cls._extract_from_doc_fallback(file_bytes)
        elif filename_lower.endswith((".txt", ".csv", ".tsv", ".md")):
            file_type = "Plain Text Report"
            extracted_text = cls._extract_from_text(file_bytes)
            page_count = 1
        else:
            # Fallback attempt as text
            file_type = "Generic Document"
            extracted_text = cls._extract_from_text(file_bytes)
            page_count = 1

        # Clean and normalize text
        cleaned_text = cls._clean_text(extracted_text)

        # Check if text was found
        if not cleaned_text.strip():
            raise ValueError(
                f"Could not extract readable text from '{filename}'. "
                "If this is a scanned physical paper or photo PDF, please ensure it contains selectable text, "
                "or export it from your lab/patient portal as digital PDF."
            )

        # Check truncation
        truncated = False
        original_char_count = len(cleaned_text)
        if len(cleaned_text) > cls.MAX_CHAR_LIMIT:
            cleaned_text = cleaned_text[:cls.MAX_CHAR_LIMIT] + "\n\n...[Report truncated due to length]..."
            truncated = True

        word_count = len(cleaned_text.split())
        char_count = len(cleaned_text)
        preview = cleaned_text[:200].replace("\n", " ").strip()
        if len(cleaned_text) > 200:
            preview += "..."

        detected_report_type = cls._detect_report_type(cleaned_text, filename)

        return {
            "filename": filename,
            "fileType": file_type,
            "extractedText": cleaned_text,
            "pageCount": page_count,
            "wordCount": word_count,
            "charCount": char_count,
            "originalCharCount": original_char_count,
            "truncated": truncated,
            "preview": preview,
            "detectedReportType": detected_report_type
        }

    @classmethod
    def _extract_from_pdf(cls, file_bytes: bytes) -> tuple[str, int]:
        stream = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(stream)
        page_count = len(reader.pages)
        pages_text = []

        for idx, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages_text.append(f"--- [Page {idx + 1}] ---\n{page_text}")
            except Exception as e:
                print(f"[DocumentService] Error extracting text from PDF page {idx + 1}: {e}")

        combined = "\n\n".join(pages_text)
        return combined, max(1, page_count)

    @classmethod
    def _extract_from_docx(cls, file_bytes: bytes) -> tuple[str, int]:
        stream = io.BytesIO(file_bytes)
        doc = docx.Document(stream)
        parts = []

        # Extract paragraphs
        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                parts.append(text)

        # Extract tables (crucial for medical lab reports)
        for table_idx, table in enumerate(doc.tables):
            table_rows = []
            for row in table.rows:
                cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                # Avoid duplicate adjacent cells from merged columns
                deduped = []
                for cell in cells:
                    if not deduped or cell != deduped[-1]:
                        deduped.append(cell)
                if any(deduped):
                    table_rows.append(" | ".join(deduped))
            if table_rows:
                parts.append(f"\n[Table {table_idx + 1}]\n" + "\n".join(table_rows))

        combined = "\n".join(parts)
        # Approximate page count (~400 words per page)
        words = len(combined.split())
        approx_pages = max(1, (words + 399) // 400)
        return combined, approx_pages

    @classmethod
    def _extract_from_doc_fallback(cls, file_bytes: bytes) -> tuple[str, int]:
        # Basic ASCII/UTF-16 printable string extraction fallback for legacy .doc binary
        try:
            # Try text extraction through regex of printable sequences
            text = file_bytes.decode("utf-8", errors="ignore")
            printable = re.findall(r"[\x20-\x7E\r\n\t]{4,}", text)
            filtered = "\n".join(p for p in printable if len(p.strip()) > 3)
            return filtered, 1
        except Exception:
            return "", 1

    @classmethod
    def _extract_from_text(cls, file_bytes: bytes) -> str:
        for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252", "ascii"]:
            try:
                return file_bytes.decode(encoding)
            except UnicodeDecodeError:
                continue
        return file_bytes.decode("utf-8", errors="replace")

    @classmethod
    def _clean_text(cls, text: str) -> str:
        if not text:
            return ""
        # Normalize carriage returns
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Collapse 3 or more newlines into 2
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Remove null bytes or control characters except tabs/newlines
        text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
        return text.strip()

    @classmethod
    def _detect_report_type(cls, text: str, filename: str) -> str:
        combined = (filename + " " + text[:2500]).lower()

        if any(term in combined for term in ["complete blood count", "cbc", "hemoglobin", "hematocrit", "wbc", "rbc", "platelets"]):
            return "Complete Blood Count (CBC)"
        elif any(term in combined for term in ["comprehensive metabolic", "basic metabolic", "cmp", "bmp", "creatinine", "bun", "electrolytes"]):
            return "Metabolic Panel (CMP/BMP)"
        elif any(term in combined for term in ["lipid", "cholesterol", "triglycerides", "hdl", "ldl", "vldl"]):
            return "Lipid Panel"
        elif any(term in combined for term in ["urinalysis", "urine culture", "urine routine", "specific gravity", "protein in urine"]):
            return "Urinalysis"
        elif any(term in combined for term in ["thyroid", "tsh", "free t4", "free t3"]):
            return "Thyroid Function Test"
        elif any(term in combined for term in ["liver function", "lft", "alt", "ast", "bilirubin", "alkaline phosphatase"]):
            return "Liver Function Test (LFT)"
        elif any(term in combined for term in ["radiology", "x-ray", "mri", "ct scan", "ultrasound", "impression", "findings"]):
            return "Radiology / Imaging Report"
        elif any(term in combined for term in ["pathology", "biopsy", "histology", "cytology", "specimen"]):
            return "Pathology Report"
        elif any(term in combined for term in ["ecg", "ekg", "electrocardiogram", "rhythm", "sinus"]):
            return "ECG / Cardiology Report"
        elif any(term in combined for term in ["hba1c", "glycated hemoglobin", "blood sugar", "glucose tolerance"]):
            return "Diabetes / Glucose Panel"
        elif any(term in combined for term in ["prescription", "rx", "dosage", "sig:", "refills"]):
            return "Medical Prescription"
        else:
            return "General Medical / Lab Report"

document_service = DocumentService()
