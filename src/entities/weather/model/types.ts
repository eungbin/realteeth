export type HourlyTemperaturePoint = {
  time: string
  tempC: number
}

/**
 * 날씨 정보 뷰 타입
 * 장소명, 현재 기온, 오늘 최저/최고 기온, 오늘 00시 ~ 23시 시간대별 기온
 */
export type WeatherView = {
  placeName: string
  tempNowC: number
  tempMinTodayC: number
  tempMaxTodayC: number
  hourlyToday: HourlyTemperaturePoint[]
}


