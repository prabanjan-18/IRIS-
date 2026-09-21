/**
 * Maps disease, condition, and symptom keywords to clinical specialties
 * and search queries for hospital discovery.
 */

export const SPECIALTY_MAP = {
  // Cardiology / Chest
  heart: { specialty: 'Cardiology', query: 'cardiology hospital cardiac center', emergency: true },
  cardiac: { specialty: 'Cardiology', query: 'cardiology hospital cardiac center', emergency: true },
  cardiology: { specialty: 'Cardiology', query: 'cardiology hospital cardiac center', emergency: true },
  chest_pain: { specialty: 'Cardiology', query: 'cardiac emergency hospital', emergency: true },
  angina: { specialty: 'Cardiology', query: 'cardiac hospital heart institute', emergency: true },
  infarction: { specialty: 'Cardiology', query: 'cardiac hospital emergency', emergency: true },

  // Endocrinology / Diabetes
  diabetes: { specialty: 'Endocrinology', query: 'diabetes center endocrinology clinic', emergency: false },
  sugar: { specialty: 'Endocrinology', query: 'diabetes endocrinology clinic', emergency: false },
  thyroid: { specialty: 'Endocrinology', query: 'endocrinology thyroid clinic', emergency: false },
  hormone: { specialty: 'Endocrinology', query: 'endocrinology hospital', emergency: false },

  // Orthopedics / Trauma / Fractures
  fracture: { specialty: 'Orthopedics', query: 'orthopedic trauma hospital bone joint clinic', emergency: true },
  bone: { specialty: 'Orthopedics', query: 'orthopedic hospital bone joint center', emergency: false },
  joint: { specialty: 'Orthopedics', query: 'orthopedic joint replacement center', emergency: false },
  orthopedic: { specialty: 'Orthopedics', query: 'orthopedic hospital clinic', emergency: false },
  orthopedics: { specialty: 'Orthopedics', query: 'orthopedic hospital clinic', emergency: false },
  sprain: { specialty: 'Orthopedics', query: 'orthopedic sports medicine urgent care', emergency: false },
  arthritis: { specialty: 'Rheumatology', query: 'rheumatology arthritis clinic', emergency: false },

  // Oncology / Cancer
  cancer: { specialty: 'Oncology', query: 'cancer hospital oncology center', emergency: false },
  oncology: { specialty: 'Oncology', query: 'oncology cancer care institute', emergency: false },
  tumor: { specialty: 'Oncology', query: 'cancer center surgical oncology', emergency: false },
  chemotherapy: { specialty: 'Oncology', query: 'cancer institute oncology hospital', emergency: false },

  // Neurology / Stroke
  stroke: { specialty: 'Neurology', query: 'neurology comprehensive stroke center hospital', emergency: true },
  brain: { specialty: 'Neurology', query: 'neurology neurosurgery hospital', emergency: true },
  neuro: { specialty: 'Neurology', query: 'neurology clinic hospital', emergency: false },
  neurology: { specialty: 'Neurology', query: 'neurology clinic hospital', emergency: false },
  seizure: { specialty: 'Neurology', query: 'neurology epilepsy emergency hospital', emergency: true },
  migraine: { specialty: 'Neurology', query: 'neurology headache clinic', emergency: false },

  // Pediatrics / Child
  child: { specialty: 'Pediatrics', query: 'childrens hospital pediatric clinic', emergency: false },
  pediatric: { specialty: 'Pediatrics', query: 'childrens hospital pediatric center', emergency: false },
  pediatrics: { specialty: 'Pediatrics', query: 'childrens hospital pediatric center', emergency: false },
  infant: { specialty: 'Pediatrics', query: 'childrens hospital neonatal pediatric care', emergency: false },
  baby: { specialty: 'Pediatrics', query: 'childrens hospital pediatric clinic', emergency: false },

  // Gynecology / Obstetrics / Maternity
  pregnancy: { specialty: 'Obstetrics & Gynecology', query: 'maternity hospital obstetrics gynecology center', emergency: false },
  maternity: { specialty: 'Obstetrics & Gynecology', query: 'maternity hospital womens health', emergency: false },
  gynecology: { specialty: 'Obstetrics & Gynecology', query: 'gynecology clinic womens hospital', emergency: false },
  obstetrics: { specialty: 'Obstetrics & Gynecology', query: 'maternity hospital obstetrics center', emergency: false },

  // Nephrology / Kidney / Urology
  kidney: { specialty: 'Nephrology', query: 'nephrology kidney hospital dialysis center', emergency: false },
  renal: { specialty: 'Nephrology', query: 'nephrology dialysis center hospital', emergency: false },
  urology: { specialty: 'Urology', query: 'urology clinic hospital', emergency: false },
  stone: { specialty: 'Urology', query: 'urology kidney stone clinic', emergency: false },

  // Pulmonology / Respiratory
  breathing: { specialty: 'Pulmonology', query: 'pulmonology respiratory hospital chest clinic', emergency: true },
  asthma: { specialty: 'Pulmonology', query: 'pulmonology asthma clinic hospital', emergency: false },
  lung: { specialty: 'Pulmonology', query: 'pulmonology chest hospital', emergency: false },
  pulmonology: { specialty: 'Pulmonology', query: 'pulmonology respiratory clinic hospital', emergency: false },

  // Ophthalmology / Eye
  eye: { specialty: 'Ophthalmology', query: 'eye hospital ophthalmology clinic', emergency: false },
  vision: { specialty: 'Ophthalmology', query: 'eye hospital ophthalmology care', emergency: false },
  ophthalmology: { specialty: 'Ophthalmology', query: 'eye hospital ophthalmology center', emergency: false },

  // ENT / Ear Nose Throat
  ent: { specialty: 'ENT (Otolaryngology)', query: 'ENT hospital ear nose throat clinic', emergency: false },
  ear: { specialty: 'ENT (Otolaryngology)', query: 'ear nose throat clinic ENT hospital', emergency: false },
  throat: { specialty: 'ENT (Otolaryngology)', query: 'ENT clinic throat specialist hospital', emergency: false },

  // Gastroenterology / Stomach / Liver
  stomach: { specialty: 'Gastroenterology', query: 'gastroenterology hospital digestive health clinic', emergency: false },
  liver: { specialty: 'Hepatology', query: 'liver institute hepatology gastroenterology', emergency: false },
  gastro: { specialty: 'Gastroenterology', query: 'gastroenterology hospital digestive diseases', emergency: false },
  gastroenterology: { specialty: 'Gastroenterology', query: 'gastroenterology hospital digestive health', emergency: false },

  // Dermatology / Skin
  skin: { specialty: 'Dermatology', query: 'dermatology clinic skin hospital', emergency: false },
  dermatology: { specialty: 'Dermatology', query: 'dermatology clinic skin care center', emergency: false },

  // Psychiatry / Mental Health
  mental: { specialty: 'Psychiatry', query: 'psychiatric hospital mental health behavioral center', emergency: false },
  psychiatry: { specialty: 'Psychiatry', query: 'psychiatric clinic mental health center', emergency: false },
  depression: { specialty: 'Psychiatry', query: 'mental health clinic psychiatry center', emergency: false },

  // Emergency / Trauma
  emergency: { specialty: 'Emergency & Trauma', query: 'emergency hospital trauma center', emergency: true },
  er: { specialty: 'Emergency & Trauma', query: 'hospital emergency room trauma care', emergency: true },
  urgent: { specialty: 'Urgent Care', query: 'urgent care clinic walk in medical center', emergency: true },
  trauma: { specialty: 'Emergency & Trauma', query: 'trauma center hospital emergency', emergency: true }
};

/**
 * Resolves a disease name, symptom, or general query into clinical specialty details.
 * @param {string} input - Disease, condition, or query string
 * @returns {{ specialty: string, query: string, isEmergency: boolean }}
 */
export function resolveSpecialty(input) {
  if (!input || typeof input !== 'string') {
    return { specialty: 'General Healthcare', query: 'hospital medical center', isEmergency: false };
  }

  const normalized = input.toLowerCase().replace(/[^a-z0-9_\s]/g, ' ').trim();
  const words = normalized.split(/\s+/);

  // 1. Direct match on full normalized text
  const cleanKey = normalized.replace(/\s+/g, '_');
  if (SPECIALTY_MAP[cleanKey]) {
    return SPECIALTY_MAP[cleanKey];
  }

  // 2. Match individual words against specialty map keys
  for (const word of words) {
    if (SPECIALTY_MAP[word]) {
      return SPECIALTY_MAP[word];
    }
  }

  // 3. Partial substring match
  for (const [key, mapping] of Object.entries(SPECIALTY_MAP)) {
    if (normalized.includes(key)) {
      return mapping;
    }
  }

  // 4. Default fallback: use the input as the query
  return {
    specialty: input.length > 25 ? 'Specialized Care' : input.charAt(0).toUpperCase() + input.slice(1),
    query: `${input} hospital clinic`,
    isEmergency: false
  };
}

export default resolveSpecialty;
