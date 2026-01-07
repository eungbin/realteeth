import { useQuery } from '@tanstack/react-query'

import { getWeatherOpenMeteo } from '../api/open-meteo'

type UseWeatherByLatLonParams = {
  lat?: number
  lon?: number
  placeName: string
  timeZone?: string
  enabled?: boolean
}

export function useWeatherByLatLon(params: UseWeatherByLatLonParams) {
  const timeZone = params.timeZone ?? 'Asia/Seoul'
  const enabled =
    params.enabled ?? (typeof params.lat === 'number' && typeof params.lon === 'number')
  return useQuery({
    enabled,
    queryKey: ['weather', { lat: params.lat, lon: params.lon, timeZone }],
    queryFn: () => {
      if (typeof params.lat !== 'number' || typeof params.lon !== 'number') {
        throw new Error('WEATHER_COORDS_MISSING')
      }
      return getWeatherOpenMeteo({
        lat: params.lat,
        lon: params.lon,
        placeName: params.placeName,
        timeZone,
      })
    },
  })
}


