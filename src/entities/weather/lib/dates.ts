/**
 * 현재 날짜를 타임존에 맞는 YYYY-MM-DD 형식으로 반환
 * @param timeZone 타임존
 * @returns YYYY-MM-DD
 */
export function getTodayIsoDateInTimeZone(timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}


