export function normalizeForSearch(s: string) {
  return s.toLowerCase().replace(/[\s-]+/g, '')
}

export function labelFromDistrictRaw(raw: string) {
  return raw.replace(/-/g, ' ')
}
