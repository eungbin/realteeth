/**
 * 기온을 °C 단위로 반올림하여 표시
 * @param value 기온
 * @returns 기온 (°C)
 */
export function formatTempC(value: number) {
  const rounded = Math.round(value)
  return `${rounded}°`
}

/**
 * ISO 날짜 시간을 KST 시간으로 변환
 * @param iso ISO 날짜 시간 (YYYY-MM-DDTHH:MM)
 * @returns KST 시간 (HH시)
 */
export function formatHourKstFromIsoDateTime(iso: string) {
  // iso: YYYY-MM-DDTHH:MM
  const hh = iso.slice(11, 13)
  return `${hh}시`
}


