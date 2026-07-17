const STORAGE_KEY = 'act_complaints_v1'

export function loadComplaints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load complaints from storage', err)
    return []
  }
}

export function saveComplaints(complaints) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints))
  } catch (err) {
    console.error('Failed to save complaints to storage', err)
  }
}

export function generateCaseId(existingCount) {
  const year = new Date().getFullYear()
  const seq = String(existingCount + 1).padStart(4, '0')
  return `GRV/${year}/${seq}`
}
