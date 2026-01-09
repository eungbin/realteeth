import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getWeatherOpenMeteo } from '@/entities/weather/api/open-meteo'

import type { FavoritePlace } from './types'
import type { FavoriteWeatherSummaryState } from './weather-summary'

type UseFavoriteWeathersParams = {
  items: FavoritePlace[]
  enabled?: boolean
  timeZone?: string
}

/**
 * 즐겨찾기 목록(최대 6개)의 날씨 요약(현재/최저/최고)을 병렬로 조회해
 * `FavoritesCard`에서 쓰기 좋은 `weatherById` 형태로 반환
 */
export function useFavoriteWeathers(params: UseFavoriteWeathersParams) {
  const timeZone = params.timeZone ?? 'Asia/Seoul'
  const enabled = params.enabled ?? true

  const queries = useQueries({
    queries: params.items.map((it) => ({
      queryKey: ['favoriteWeather', { id: it.id, lat: it.lat, lon: it.lon, timeZone }],
      enabled,
      queryFn: () =>
        getWeatherOpenMeteo({
          lat: it.lat,
          lon: it.lon,
          placeName: it.placeName,
          timeZone,
        }),
    })),
  })

  const weatherById = useMemo(() => {
    const map: Record<string, FavoriteWeatherSummaryState> = {}
    for (let i = 0; i < params.items.length; i += 1) {
      const it = params.items[i]
      const q = queries[i]
      if (!q) continue

      if (q.isPending || q.isFetching) {
        map[it.id] = { status: 'loading' }
        continue
      }
      if (q.isError) {
        map[it.id] = { status: 'error' }
        continue
      }
      if (q.data) {
        map[it.id] = {
          status: 'success',
          tempNowC: q.data.tempNowC,
          tempMinTodayC: q.data.tempMinTodayC,
          tempMaxTodayC: q.data.tempMaxTodayC,
        }
        continue
      }

      map[it.id] = { status: 'loading' }
    }

    return map
  }, [params.items, queries])

  return { weatherById, queries }
}