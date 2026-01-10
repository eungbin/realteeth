import { useCallback, useEffect, useMemo, useState } from 'react'

import { FAVORITES_LIMIT, loadFavorites, makePlaceId, saveFavorites } from './storage'
import type { FavoritePlace } from './types'

export type AddFavoriteResult =
  | { ok: true; item: FavoritePlace }
  | { ok: false; reason: 'limit' | 'duplicate' | 'storage' }

export type RenameFavoriteResult =
  | { ok: true; item: FavoritePlace }
  | { ok: false; reason: 'empty' | 'storage' }

export function useFavorites() {
  const [items, setItems] = useState<FavoritePlace[]>(() => loadFavorites())

  useEffect(() => {
    const sync = () => setItems(loadFavorites())
    window.addEventListener('storage', sync)
    window.addEventListener('realteeth:favorites:changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('realteeth:favorites:changed', sync)
    }
  }, [])

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const isFavorite = useCallback(
    (lat: number, lon: number) => {
      const id = makePlaceId(lat, lon)
      return ids.has(id)
    },
    [ids],
  )

  const add = useCallback(
    (place: { placeName: string; lat: number; lon: number }): AddFavoriteResult => {
      const placeName = place.placeName.trim()
      if (!placeName) return { ok: false, reason: 'storage' }

      const id = makePlaceId(place.lat, place.lon)
      if (ids.has(id)) return { ok: false, reason: 'duplicate' }
      if (items.length >= FAVORITES_LIMIT) return { ok: false, reason: 'limit' }

      const item: FavoritePlace = {
        id,
        placeName,
        lat: place.lat,
        lon: place.lon,
        createdAt: Date.now(),
      }

      const next = [...items, item]
      try {
        saveFavorites(next)
        setItems(next)
        return { ok: true, item }
      } catch {
        return { ok: false, reason: 'storage' }
      }
    },
    [ids, items],
  )

  const remove = useCallback(
    (id: string) => {
      const next = items.filter((i) => i.id !== id)
      saveFavorites(next)
      setItems(next)
    },
    [items],
  )

  const rename = useCallback(
    (id: string, nextPlaceName: string): RenameFavoriteResult => {
      const placeName = nextPlaceName.trim()
      if (!placeName) return { ok: false, reason: 'empty' }

      const existing = items.find((i) => i.id === id)
      if (!existing) return { ok: false, reason: 'storage' }

      const next = items.map((i) => (i.id === id ? { ...i, placeName } : i))
      try {
        saveFavorites(next)
        setItems(next)
        return { ok: true, item: { ...existing, placeName } }
      } catch {
        return { ok: false, reason: 'storage' }
      }
    },
    [items],
  )

  return { items, add, remove, rename, isFavorite, limit: FAVORITES_LIMIT }
}


