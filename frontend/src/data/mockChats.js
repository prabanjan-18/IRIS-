// Mock dataset for past conversations in Iris
// Contains 22 realistic healthcare consultation threads to demonstrate sidebar pagination (>15 items -> View all)

export const mockChats = [
  {
    id: "chat-01",
    title: "Persistent Tension Headache & Eyestrain",
    lastMessagePreview: "Based on your symptoms of dull aching across your forehead and eye fatigue...",
    timestamp: "10 mins ago",
    date: "2026-09-01",
    triage: "self",
    category: "General Health"
  },
  {
    id: "chat-02",
    title: "Low-grade Fever & Fatigue Evaluation",
    lastMessagePreview: "A temperature of 100.2°F for 24 hours with mild fatigue usually suggests...",
    timestamp: "2 hours ago",
    date: "2026-09-01",
    triage: "caution",
    category: "Infectious Symptoms"
  },
  {
    id: "chat-03",
    title: "Sharp Chest Pressure During Exercise",
    lastMessagePreview: "Red flag detected: Any acute exertional chest tightness requires immediate evaluation...",
    timestamp: "Yesterday",
    date: "2026-08-31",
    triage: "urgent",
    category: "Cardiovascular"
  },
  {
    id: "chat-04",
    title: "Amoxicillin Side Effects & Dosing",
    lastMessagePreview: "Mild gastrointestinal upset is common with amoxicillin. Take with food unless...",
    timestamp: "Yesterday",
    date: "2026-08-31",
    triage: "self",
    category: "Medication"
  },
  {
    id: "chat-05",
    title: "Post-Workout Knee Swelling Guidance",
    lastMessagePreview: "R.I.C.E. protocol (Rest, Ice, Compression, Elevation) is recommended for non-traumatic...",
    timestamp: "3 days ago",
    date: "2026-08-29",
    triage: "self",
    category: "Orthopedics"
  },
  {
    id: "chat-06",
    title: "Seasonal Allergy Rash vs Hives",
    lastMessagePreview: "Contact dermatitis usually presents as localized redness, whereas urticaria...",
    timestamp: "4 days ago",
    date: "2026-08-28",
    triage: "self",
    category: "Dermatology"
  },
  {
    id: "chat-07",
    title: "GERD & Nighttime Acid Reflux Relief",
    lastMessagePreview: "Elevating the head of your bed by 6 inches and avoiding meal intake 3 hours prior to sleep...",
    timestamp: "Aug 25",
    date: "2026-08-25",
    triage: "self",
    category: "Gastroenterology"
  },
  {
    id: "chat-08",
    title: "Child's Spiking Fever & Barking Cough",
    lastMessagePreview: "A barking seal-like cough in young children can be indicative of croup. Monitor for stridor...",
    timestamp: "Aug 22",
    date: "2026-08-22",
    triage: "caution",
    category: "Pediatrics"
  },
  {
    id: "chat-09",
    title: "Insomnia & Sleep Hygiene Protocol",
    lastMessagePreview: "Cognitive behavioral techniques for insomnia recommend restricting bed time to actual sleep...",
    timestamp: "Aug 20",
    date: "2026-08-20",
    triage: "self",
    category: "Sleep Medicine"
  },
  {
    id: "chat-10",
    title: "Sudden Severe Abdominal Lower Right Pain",
    lastMessagePreview: "Urgent care caution: Right lower quadrant pain with rebound tenderness requires rule-out appendicitis...",
    timestamp: "Aug 18",
    date: "2026-08-18",
    triage: "urgent",
    category: "Emergency Triage"
  },
  {
    id: "chat-11",
    title: "Metformin Dietary Considerations",
    lastMessagePreview: "Metformin extended-release should be taken with dinner to minimize gastrointestinal discomfort...",
    timestamp: "Aug 15",
    date: "2026-08-15",
    triage: "self",
    category: "Endocrinology"
  },
  {
    id: "chat-12",
    title: "Sprained Ankle Recovery Timeline",
    lastMessagePreview: "Grade 1 ankle sprains generally resolve within 2 to 4 weeks with early mobility...",
    timestamp: "Aug 12",
    date: "2026-08-12",
    triage: "self",
    category: "Orthopedics"
  },
  {
    id: "chat-13",
    title: "Sinus Pressure & Yellow Nasal Discharge",
    lastMessagePreview: "Viral rhinosinusitis usually peaks around day 3-5. If symptoms persist beyond 10 days...",
    timestamp: "Aug 10",
    date: "2026-08-10",
    triage: "caution",
    category: "ENT"
  },
  {
    id: "chat-14",
    title: "Vitamin D3 Supplement Dosage Query",
    lastMessagePreview: "Standard maintenance doses range between 1000 IU to 2000 IU daily for adults with normal absorption...",
    timestamp: "Aug 05",
    date: "2026-08-05",
    triage: "self",
    category: "Nutrition"
  },
  {
    id: "chat-15",
    title: "Persistent Dry Eyes from Screen Use",
    lastMessagePreview: "Follow the 20-20-20 rule and consider preservative-free artificial tears twice daily...",
    timestamp: "Jul 30",
    date: "2026-07-30",
    triage: "self",
    category: "Ophthalmology"
  },
  {
    id: "chat-16",
    title: "Blood Pressure Reading 138/88 Interpretation",
    lastMessagePreview: "138/88 mmHg falls under Stage 1 Hypertension according to AHA guidelines. Recheck after rest...",
    timestamp: "Jul 25",
    date: "2026-07-25",
    triage: "caution",
    category: "Cardiovascular"
  },
  {
    id: "chat-17",
    title: "Lisinopril Dry Cough Symptom",
    lastMessagePreview: "ACE inhibitor-induced cough occurs in up to 10% of patients. Consult your prescriber for ARB alternatives...",
    timestamp: "Jul 20",
    date: "2026-07-20",
    triage: "caution",
    category: "Pharmacology"
  },
  {
    id: "chat-18",
    title: "Mild Upper Respiratory Congestion",
    lastMessagePreview: "Hydration, steam inhalation, and saline sprays provide relief for upper airway inflammation...",
    timestamp: "Jul 15",
    date: "2026-07-15",
    triage: "self",
    category: "Infectious Symptoms"
  },
  {
    id: "chat-19",
    title: "Iron Supplementation & Vitamin C",
    lastMessagePreview: "Vitamin C enhances non-heme iron absorption when taken concurrently on an empty stomach...",
    timestamp: "Jul 10",
    date: "2026-07-10",
    triage: "self",
    category: "Nutrition"
  },
  {
    id: "chat-20",
    title: "Migraine with Aura Warning Signs",
    lastMessagePreview: "Visual scintillations lasting 20-30 minutes before headache onset are classic for aura...",
    timestamp: "Jul 05",
    date: "2026-07-05",
    triage: "caution",
    category: "Neurology"
  },
  {
    id: "chat-21",
    title: "Shortness of Breath with Blue Lips",
    lastMessagePreview: "CRITICAL ALERT: Cyanosis (blue-tinged lips/fingertips) indicates severe hypoxia. Seek emergency care now.",
    timestamp: "Jun 28",
    date: "2026-06-28",
    triage: "urgent",
    category: "Emergency Triage"
  },
  {
    id: "chat-22",
    title: "Daily Hydration Guidelines & Electrolytes",
    lastMessagePreview: "Baseline fluid intake for healthy adults is roughly 2.7 to 3.7 liters per day from all sources...",
    timestamp: "Jun 20",
    date: "2026-06-20",
    triage: "self",
    category: "Wellness"
  }
];
