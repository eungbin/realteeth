import { useMemo } from 'react'

import { labelFromDistrictRaw, normalizeForSearch } from './normalize'

export type DistrictSuggestion = {
  raw: string
  label: string
}

export function useDistrictAutocomplete(params: {
  items: string[]
  query: string
  limit?: number
}): DistrictSuggestion[] {
  const limit = params.limit ?? 10
  return useMemo(() => {
    const q = params.query.trim()
    if (q.length < 2) return []
    const nq = normalizeForSearch(q)
    if (!nq) return []

    const hits: Array<{ raw: string; label: string; score: number }> = []
    for (const raw of params.items) {
      if (typeof raw !== 'string') continue
      const label = labelFromDistrictRaw(raw)
      const idx = normalizeForSearch(label).indexOf(nq)
      if (idx === -1) continue
      // 앞쪽에 가까울수록, 짧을수록 우선
      const score = idx * 10 + label.length
      hits.push({ raw, label, score })
    }

    hits.sort((a, b) => a.score - b.score)
    return hits.slice(0, limit).map(({ raw, label }) => ({ raw, label }))
  }, [params.items, params.query, limit])
}


