export type FavoriteWeatherSummaryState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; tempNowC: number; tempMinTodayC: number; tempMaxTodayC: number }


