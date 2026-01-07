import type { HourlyTemperaturePoint, WeatherView } from '../model/types'

import { getTodayIsoDateInTimeZone } from '../lib/dates'

type OpenMeteoForecastResponse = {
  current?: {
    temperature_2m?: number
    time?: string
  }
  hourly?: {
    time?: string[]
    temperature_2m?: number[]
  }
  daily?: {
    time?: string[]
    temperature_2m_min?: number[]
    temperature_2m_max?: number[]
  }
}

type GetWeatherParams = {
  lat: number
  lon: number
  timeZone: string
  placeName: string
}

function toHourlyToday24(params: {
  todayIsoDate: string
  hourlyTime: string[]
  hourlyTemp: number[]
}): HourlyTemperaturePoint[] {
  // 24개의 시간대별 기온 정보를 반환
  const points: HourlyTemperaturePoint[] = []
  for (let i = 0; i < params.hourlyTime.length; i += 1) {
    const t = params.hourlyTime[i]
    const temp = params.hourlyTemp[i]
    if (typeof t !== 'string' || typeof temp !== 'number') continue
    if (!t.startsWith(params.todayIsoDate + 'T')) continue
    points.push({ time: t, tempC: temp })
  }

  points.sort((a, b) => a.time.localeCompare(b.time))

  const first24 = points.slice(0, 24)
  return first24
}

export async function getWeatherOpenMeteo(
  params: GetWeatherParams,
): Promise<WeatherView> {
  const today = getTodayIsoDateInTimeZone(params.timeZone)

  const url =
    'https://api.open-meteo.com/v1/forecast?' +
    new URLSearchParams({
      latitude: String(params.lat),
      longitude: String(params.lon),
      timezone: params.timeZone,
      current: 'temperature_2m',
      daily: 'temperature_2m_min,temperature_2m_max',
      hourly: 'temperature_2m',
      start_date: today,
      end_date: today,
    }).toString()

  const res = await fetch(url)
  if (!res.ok) throw new Error('WEATHER_FETCH_FAILED')
  const data = (await res.json()) as OpenMeteoForecastResponse

  const tempNow = data.current?.temperature_2m
  const minToday = data.daily?.temperature_2m_min?.[0]
  const maxToday = data.daily?.temperature_2m_max?.[0]
  const hourlyTime = data.hourly?.time
  const hourlyTemp = data.hourly?.temperature_2m

  if (
    typeof tempNow !== 'number' ||
    typeof minToday !== 'number' ||
    typeof maxToday !== 'number' ||
    !Array.isArray(hourlyTime) ||
    !Array.isArray(hourlyTemp)
  ) {
    throw new Error('WEATHER_DATA_MISSING')
  }

  const hourlyToday = toHourlyToday24({
    todayIsoDate: today,
    hourlyTime,
    hourlyTemp,
  })

  if (hourlyToday.length !== 24) {
    // 요구사항을 만족하는 형태로 제공이 안 되면 "데이터 없음" 처리하기 위함
    throw new Error('WEATHER_HOURLY_INCOMPLETE')
  }

  return {
    placeName: params.placeName,
    tempNowC: tempNow,
    tempMinTodayC: minToday,
    tempMaxTodayC: maxToday,
    hourlyToday,
  }
}


