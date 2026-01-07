import type { HourlyTemperaturePoint } from '@/entities/weather'

import { formatHourKstFromIsoDateTime, formatTempC } from '@/shared/lib/format'

type WeatherHourlyProps =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'success'; points: HourlyTemperaturePoint[] }

/**
 * 시간대별 기온 카드
 * 오늘 00시 ~ 23시 시간대별 기온
 * @param props { status: 'loading' | 'error' | 'empty' | 'success'; points: HourlyTemperaturePoint[] }
 * @returns 시간대별 기온 카드
 */
export function WeatherHourly(props: WeatherHourlyProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">시간대별 기온</div>
        <div className="text-xs text-slate-500">오늘 00시 ~ 23시</div>
      </div>

      {props.status === 'loading' ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-16 shrink-0 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : null}

      {props.status === 'error' || props.status === 'empty' ? (
        <div className="mt-4 text-sm text-slate-600">{props.message}</div>
      ) : null}

      {props.status === 'success' ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {props.points.map((p) => (
            <div
              key={p.time}
              className="w-16 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center"
            >
              <div className="text-xs text-slate-500">
                {formatHourKstFromIsoDateTime(p.time)}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatTempC(p.tempC)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}


