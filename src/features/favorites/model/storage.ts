import type { FavoritePlace } from './types'

const STORAGE_KEY = 'realteeth:favorites:v1'
export const FAVORITES_LIMIT = 6

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json) as unknown
  } catch {
    return undefined
  }
}

export function makePlaceId(lat: number, lon: number) {
  // 중복방지
  return `${lat.toFixed(5)},${lon.toFixed(5)}`
}

export function loadFavorites(): FavoritePlace[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  const parsed = safeParse(raw)
  if (!Array.isArray(parsed)) return []

  const out: FavoritePlace[] = []
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const it = item as Partial<FavoritePlace>
    if (
      typeof it.id !== 'string' ||
      typeof it.placeName !== 'string' ||
      typeof it.lat !== 'number' ||
      typeof it.lon !== 'number' ||
      typeof it.createdAt !== 'number'
    ) {
      continue
    }
    out.push(it as FavoritePlace)
  }
  // createdAt 기준 추가 순서 유지
  out.sort((a, b) => a.createdAt - b.createdAt)
  return out.slice(0, FAVORITES_LIMIT)
}

export function saveFavorites(items: FavoritePlace[]) {
  if (typeof window === 'undefined') return
  const trimmed = items.slice(0, FAVORITES_LIMIT)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  // 같은 탭에서도 훅이 감지할 수 있게 커스텀 이벤트 발행
  window.dispatchEvent(new Event('realteeth:favorites:changed'))
}


