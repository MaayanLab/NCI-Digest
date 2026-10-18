/** In-memory handoff from the landing upload to the collection form. Survives in-app login. */

let pending = null

export function setPendingPaper({ file, title = "", url = "", mediums = [] }) {
  pending = {
    file,
    title: String(title || "").trim(),
    url: String(url || "").trim(),
    mediums: Array.isArray(mediums) ? mediums.filter(Boolean) : [],
    createdAt: Date.now(),
  }
}

export function getPendingPaper() {
  return pending
}

export function clearPendingPaper() {
  pending = null
}
