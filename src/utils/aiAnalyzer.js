// aiAnalyzer.js
// A deterministic, explainable rule-and-keyword scoring engine that simulates
// what an LLM-based triage classifier would do — with zero external API calls,
// so the app runs fully offline / with no API keys.
//
// Swap the body of `analyzeComplaint` for a real LLM API call later if desired;
// the return shape is the contract the rest of the app depends on.

const CATEGORY_DEFINITIONS = [
  {
    key: 'Water Supply',
    department: 'Public Health Engineering Department (PHED)',
    keywords: ['water', 'tap', 'pipeline', 'pipe leak', 'borewell', 'tanker', 'drinking water', 'contaminated water', 'water supply', 'no water', 'water shortage', 'leakage'],
    baseWeight: 3,
  },
  {
    key: 'Electricity',
    department: 'State Electricity Distribution Board',
    keywords: ['electricity', 'power cut', 'transformer', 'voltage', 'power outage', 'streetlight', 'street light', 'wire', 'short circuit', 'power supply', 'meter', 'blackout'],
    baseWeight: 3,
  },
  {
    key: 'Roads & Infrastructure',
    department: 'Public Works Department (PWD)',
    keywords: ['road', 'pothole', 'bridge', 'footpath', 'construction', 'street', 'flyover', 'culvert', 'pavement', 'traffic signal', 'divider'],
    baseWeight: 2,
  },
  {
    key: 'Sanitation & Waste',
    department: 'Municipal Corporation – Sanitation Wing',
    keywords: ['garbage', 'waste', 'sewage', 'drain', 'drainage', 'trash', 'dump', 'sanitation', 'sewer', 'overflow', 'foul smell', 'stray animal', 'cleaning'],
    baseWeight: 3,
  },
  {
    key: 'Public Health',
    department: 'District Health Department',
    keywords: ['hospital', 'health', 'disease', 'outbreak', 'mosquito', 'dengue', 'malaria', 'epidemic', 'medicine', 'doctor', 'clinic', 'ambulance', 'contamination'],
    baseWeight: 4,
  },
  {
    key: 'Law & Order',
    department: 'District Police Department',
    keywords: ['theft', 'crime', 'harassment', 'assault', 'violence', 'police', 'safety', 'threat', 'robbery', 'fraud', 'eve teasing', 'illegal', 'weapon'],
    baseWeight: 4,
  },
  {
    key: 'Education',
    department: 'District Education Department',
    keywords: ['school', 'teacher', 'student', 'college', 'education', 'scholarship', 'classroom', 'exam', 'admission'],
    baseWeight: 2,
  },
  {
    key: 'Corruption',
    department: 'Vigilance & Anti-Corruption Bureau',
    keywords: ['bribe', 'corruption', 'illegal fee', 'extortion', 'demanded money', 'kickback', 'official misconduct'],
    baseWeight: 4,
  },
  {
    key: 'Public Transport',
    department: 'Regional Transport Authority',
    keywords: ['bus', 'transport', 'auto', 'rickshaw', 'fare', 'railway', 'station', 'overcrowd', 'route'],
    baseWeight: 2,
  },
  {
    key: 'Housing & Land',
    department: 'Municipal Corporation – Estate & Housing Wing',
    keywords: ['housing', 'land', 'encroachment', 'illegal construction', 'eviction', 'property', 'slum', 'rent'],
    baseWeight: 2,
  },
  {
    key: 'Noise & Environment',
    department: 'State Pollution Control Board',
    keywords: ['noise', 'pollution', 'smoke', 'factory', 'air quality', 'loudspeaker', 'emission', 'dust'],
    baseWeight: 2,
  },
]

const URGENCY_KEYWORDS = {
  critical: ['emergency', 'fire', 'death', 'died', 'dying', 'life threatening', 'collapsed', 'collapse', 'explosion', 'drowning', 'severely injured', 'critical condition', 'immediate danger'],
  high: ['urgent', 'immediately', 'since 3 days', 'since days', 'overflow', 'contaminated', 'outbreak', 'no water since', 'no power since', 'children affected', 'elderly', 'disabled', 'accident'],
  medium: ['since a week', 'repeated', 'again', 'complaint filed before', 'no response', 'ignored', 'delay'],
}

const RESOLUTION_TIME_MATRIX = {
  Critical: '24–48 hours',
  High: '3–5 working days',
  Medium: '7–10 working days',
  Low: '15–20 working days',
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function scoreCategories(text) {
  const scores = CATEGORY_DEFINITIONS.map((cat) => {
    let score = 0
    let hits = []
    cat.keywords.forEach((kw) => {
      if (text.includes(kw)) {
        score += cat.baseWeight + kw.split(' ').length // multi-word matches score slightly higher
        hits.push(kw)
      }
    })
    return { ...cat, score, hits }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores
}

function detectUrgencyLevel(text) {
  for (const kw of URGENCY_KEYWORDS.critical) {
    if (text.includes(kw)) return { level: 'critical', matched: kw }
  }
  for (const kw of URGENCY_KEYWORDS.high) {
    if (text.includes(kw)) return { level: 'high', matched: kw }
  }
  for (const kw of URGENCY_KEYWORDS.medium) {
    if (text.includes(kw)) return { level: 'medium', matched: kw }
  }
  return { level: 'none', matched: null }
}

function computePriority({ topCategory, urgency, textLength }) {
  // Weighted scoring: category sensitivity + urgency keywords + description detail
  let points = 0

  const categoryUrgencyMap = {
    'Public Health': 3,
    'Law & Order': 3,
    Electricity: 2,
    'Water Supply': 2,
    'Sanitation & Waste': 2,
    Corruption: 2,
  }
  points += categoryUrgencyMap[topCategory?.key] || 1

  if (urgency.level === 'critical') points += 6
  else if (urgency.level === 'high') points += 4
  else if (urgency.level === 'medium') points += 2

  if (textLength > 220) points += 1 // more detail often signals a serious, well-documented issue

  if (points >= 8) return 'Critical'
  if (points >= 5) return 'High'
  if (points >= 3) return 'Medium'
  return 'Low'
}

function buildActionPlan(category, priority) {
  const plans = {
    'Water Supply': [
      'Dispatch PHED field officer to verify the reported location within 24 hours',
      'Inspect pipeline / borewell for leakage, contamination, or supply disruption',
      'Coordinate emergency water tanker if supply is fully interrupted',
      'Issue repair work order and communicate estimated restoration timeline to resident',
    ],
    Electricity: [
      'Assign lineman/technician to inspect transformer or reported fault',
      'Check load and voltage fluctuation logs for the feeder line',
      'Schedule repair or replacement of faulty equipment',
      'Notify affected households of restoration ETA via SMS alert',
    ],
    'Roads & Infrastructure': [
      'Conduct site inspection with PWD engineer',
      'Assess severity and mark for temporary safety barricading if hazardous',
      'Add to road repair work schedule based on severity ranking',
      'Update the complainant with the scheduled repair window',
    ],
    'Sanitation & Waste': [
      'Deploy sanitation crew for inspection within 48 hours',
      'Clear blockage / overflow and arrange waste collection',
      'Conduct fumigation if health risk is identified',
      'Set up periodic monitoring for recurrence',
    ],
    'Public Health': [
      'Flag case to District Health Officer for immediate review',
      'Deploy medical/health inspection team to affected area',
      'Initiate preventive measures (fogging, testing, awareness drive) if outbreak-related',
      'Coordinate with nearest primary health centre for follow-up care',
    ],
    'Law & Order': [
      'Forward complaint to jurisdictional police station for immediate action',
      'Log FIR or formal report if applicable',
      'Assign officer for follow-up investigation and victim support',
      'Provide complainant with case reference number and safety guidance',
    ],
    Education: [
      'Route complaint to District Education Officer',
      'Verify facts with concerned school/college administration',
      'Initiate corrective or disciplinary process if warranted',
      'Update complainant with resolution steps taken',
    ],
    Corruption: [
      'Escalate to Vigilance & Anti-Corruption Bureau confidentially',
      'Preserve complaint details and any evidence securely',
      'Assign case for discreet investigation',
      'Protect complainant identity per whistleblower protocol',
    ],
    'Public Transport': [
      'Notify Regional Transport Authority of the reported issue',
      'Inspect the route/vehicle/stop in question',
      'Take corrective action with operator or transport staff',
      'Share resolution update with complainant',
    ],
    'Housing & Land': [
      'Assign Estate & Housing Wing officer for site verification',
      'Review land records / encroachment status',
      'Initiate legal or regulatory action if violation confirmed',
      'Communicate next steps and timeline to resident',
    ],
    'Noise & Environment': [
      'Send Pollution Control Board inspector to assess the source',
      'Measure noise/emission levels against permissible limits',
      'Issue notice or penalty to violating party if confirmed',
      'Follow up within 2 weeks to confirm compliance',
    ],
    Other: [
      'Route complaint to General Administration Department for triage',
      'Verify details directly with the complainant',
      'Reassign to the appropriate department once identified',
      'Provide status update within 5 working days',
    ],
  }
  const steps = plans[category] || plans.Other
  if (priority === 'Critical') {
    return ['Escalate immediately to senior district authority for same-day intervention', ...steps]
  }
  return steps
}

function buildExecutiveSummary({ name, district, description, category, priority, urgency }) {
  const urgencyPhrase =
    urgency.level === 'critical'
      ? 'The description indicates a potentially life-threatening or emergency situation requiring immediate escalation.'
      : urgency.level === 'high'
      ? 'The complaint contains language suggesting significant, time-sensitive impact on residents.'
      : urgency.level === 'medium'
      ? 'This appears to be a recurring or unresolved issue that has persisted over time.'
      : 'This appears to be a standard civic issue without immediate emergency indicators.'

  const trimmedDesc = description.length > 140 ? description.slice(0, 140).trim() + '…' : description

  return `${name} from ${district} has raised a ${category.toLowerCase()} complaint: "${trimmedDesc}" Based on automated analysis, this has been classified as ${priority} priority. ${urgencyPhrase} The case has been routed to the appropriate department for action.`
}

export function analyzeComplaint({ name, district, description }) {
  const text = normalize(`${description} ${district}`)
  const categoryScores = scoreCategories(text)
  const topCategory = categoryScores[0].score > 0 ? categoryScores[0] : { key: 'Other', department: 'General Administration Department', score: 0, hits: [] }

  const urgency = detectUrgencyLevel(text)
  const priority = computePriority({ topCategory, urgency, textLength: description.length })

  const confidence = Math.min(97, 58 + topCategory.score * 4 + (urgency.level !== 'none' ? 8 : 0))

  const executiveSummary = buildExecutiveSummary({ name, district, description, category: topCategory.key, priority, urgency })
  const actionPlan = buildActionPlan(topCategory.key, priority)
  const resolutionTime = RESOLUTION_TIME_MATRIX[priority]

  return {
    category: topCategory.key,
    department: topCategory.department,
    priority,
    confidence,
    matchedKeywords: topCategory.hits,
    urgencySignal: urgency.matched,
    executiveSummary,
    actionPlan,
    resolutionTime,
    analyzedAt: new Date().toISOString(),
  }
}
