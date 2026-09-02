// Mock message history for specific active chats in Iris

export const mockMessages = {
  "chat-01": [
    {
      id: "msg-101",
      sender: "user",
      text: "I've had a dull, aching headache across my forehead and behind my eyes for the past 2 days. It gets worse after staring at my monitor. No fever or vomiting.",
      timestamp: "10:14 AM"
    },
    {
      id: "msg-102",
      sender: "assistant",
      timestamp: "10:15 AM",
      structuredData: {
        triageLevel: "self", // 'self' | 'caution' | 'urgent'
        triageLabel: "Self-care may be appropriate",
        summary: "Your symptoms of a bilateral band-like dull headache exacerbated by screen use strongly align with a Tension-Type Headache (TTH) compounded by digital eye strain.",
        causes: [
          "Digital eye strain (asthenopia) from prolonged blue light & screen focus",
          "Muscle tension in the pericranial, suboccipital, and neck muscles",
          "Dehydration or irregular caffeine intake",
          "Postural stress during desk work"
        ],
        selfCare: [
          "Follow the 20-20-20 rule: Every 20 minutes, look at an object 20 feet away for 20 seconds",
          "Apply warm compresses to your neck or cool compresses to your forehead",
          "Maintain hydration (at least 2 to 2.5 liters of water daily)",
          "Over-the-counter analgesics such as Ibuprofen (200–400mg) or Acetaminophen (500mg) if medically appropriate for you",
          "Adjust display brightness and contrast to match room lighting"
        ],
        whenToSeekCare: [
          "If the headache becomes sudden and severe ('thunderclap headache')",
          "If accompanied by neurological signs like numbness, slurred speech, or vision loss",
          "If fever, stiff neck, or confusion develops",
          "If pain persists continuously for more than 7 days despite rest"
        ],
        sources: [
          {
            title: "Mayo Clinic — Tension Headache Diagnosis & Care",
            url: "https://www.mayoclinic.org/diseases-conditions/tension-headache",
            snippet: "Tension headaches are diffuse, mild-to-moderate pain in your head that's often described as feeling like a tight band around your head. First-line management includes lifestyle modifications and non-prescription pain relievers."
          },
          {
            title: "American Academy of Ophthalmology — Computer Vision Syndrome",
            url: "https://www.aao.org/eye-health/tips-prevention/computer-usage",
            snippet: "Focusing on screens reduces blink rate by up to 50%, leading to dry eye and ciliary muscle spasm."
          },
          {
            title: "UpToDate — Patient Education: Headache in Adults",
            url: "https://www.uptodate.com/contents/headache-overview",
            snippet: "Primary headaches represent over 90% of headache consultations in primary care, with tension-type headaches being the most frequent."
          }
        ]
      }
    }
  ],
  "chat-02": [
    {
      id: "msg-201",
      sender: "user",
      text: "I woke up with a 100.2°F fever, chills, and mild body aches. Should I see a doctor today?",
      timestamp: "08:30 AM"
    },
    {
      id: "msg-202",
      sender: "assistant",
      timestamp: "08:31 AM",
      structuredData: {
        triageLevel: "caution",
        triageLabel: "Consider seeing a doctor soon",
        summary: "A low-grade fever (100.2°F) accompanied by chills and myalgia typically indicates an early acute viral immune response, such as influenza or early upper respiratory viral infection.",
        causes: [
          "Influenza virus (Flu)",
          "Common cold (Rhinovirus / Adenovirus)",
          "Early viral gastroenteritis or respiratory viral infection"
        ],
        selfCare: [
          "Get plenty of bed rest to aid immune recovery",
          "Drink clear fluids (water, herbal tea, oral rehydration solutions) to prevent dehydration",
          "Take antipyretics like Acetaminophen (500-1000mg) or Ibuprofen to lower fever if uncomfortable"
        ],
        whenToSeekCare: [
          "If your fever exceeds 103°F (39.4°C) or does not respond to fever reducers",
          "If fever persists for longer than 3 consecutive days",
          "If shortness of breath, chest tightness, or persistent vomiting develops",
          "If you have high-risk chronic conditions (e.g., asthma, immunocompromise, diabetes)"
        ],
        sources: [
          {
            title: "CDC — Fever Treatment & When to Seek Medical Evaluation",
            url: "https://www.cdc.gov/flu/treatment/takingcare.htm",
            snippet: "Fevers under 102°F usually do not require medical intervention in healthy adults unless accompanied by red flag symptoms or persistent elevation past 72 hours."
          },
          {
            title: "Mayo Clinic — Influenza (Flu) Clinical Overview",
            url: "https://www.mayoclinic.org/diseases-conditions/flu",
            snippet: "Early antiviral therapy within 48 hours of symptom onset may shorten duration in high-risk individuals."
          }
        ]
      }
    }
  ],
  "chat-03": [
    {
      id: "msg-301",
      sender: "user",
      text: "I felt a sharp squeezing chest pressure and shortness of breath while jogging this morning. It eased up when I sat down.",
      timestamp: "07:15 AM"
    },
    {
      id: "msg-302",
      sender: "assistant",
      timestamp: "07:16 AM",
      structuredData: {
        triageLevel: "urgent",
        triageLabel: "Seek urgent/emergency care",
        summary: "EXERTIONAL CHEST PRESSURE WARNING: Squeezing chest tightness precipitated by physical exertion that resolves with rest is a classic presentation of exertional angina and requires urgent medical evaluation.",
        causes: [
          "Stable or Unstable Angina Pectoris",
          "Myocardial Ischemia / Coronary Artery Vasospasm",
          "Hypertensive Exertional Response",
          "Exercise-Induced Bronchospasm or Pulmonary Etiology"
        ],
        selfCare: [
          "STOP all physical exertion immediately and sit upright in a comfortable position",
          "Do NOT attempt to drive yourself to the emergency department — call local emergency services (911/112) or have someone take you to the nearest Emergency Room",
          "If prescribed sublingual Nitroglycerin by your doctor, take as directed"
        ],
        whenToSeekCare: [
          "SEEK IMMEDIATE EMERGENCY CARE NOW if pressure returns, radiates to left arm, neck, or jaw, or is accompanied by cold sweats or dizziness."
        ],
        sources: [
          {
            title: "American Heart Association — Warning Signs of a Heart Attack",
            url: "https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack",
            snippet: "Chest discomfort that occurs with exercise or stress and goes away with rest may be angina, a signal that your heart is not getting enough oxygen."
          },
          {
            title: "ACC/AHA Guidelines — Evaluation of Chest Pain",
            url: "https://www.jacc.org/doi/10.1016/j.jacc.2021.07.053",
            snippet: "All patients with acute exertional chest pain of suspected ischemic origin should undergo prompt emergency cardiac workup."
          }
        ]
      }
    }
  ]
};
