import type { WeatherView } from '@/entities/weather'

import { formatTempC } from '@/shared/lib/format'

type WeatherSummaryProps =
  | { status: 'loading'; title: string }
  | { status: 'error'; title: string; message: string }
  | { status: 'empty'; title: string; message: string }
  | { status: 'success'; title: string; weather: WeatherView }

/**
 * 날씨 요약 카드
 * 장소명, 현재 기온, 오늘 최저/최고 기온
 * @param props { status: 'loading' | 'error' | 'empty' | 'success'; title: string; weather: WeatherView }
 * @returns 날씨 요약 카드
 */
export function WeatherSummary(props: WeatherSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-700">{props.title}</div>
          {'weather' in props ? (
            <div className="mt-1 text-sm text-slate-500">{props.weather.placeName}</div>
          ) : null}
        </div>
        {'weather' in props ? (
          <div className="text-right text-sm text-slate-500">
            <div>
              최저 {formatTempC(props.weather.tempMinTodayC)} / 최고{' '}
              {formatTempC(props.weather.tempMaxTodayC)}
            </div>
          </div>
        ) : null}
      </div>

      {props.status === 'loading' ? (
        <div className="mt-6 animate-pulse">
          <div className="h-10 w-32 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-52 rounded bg-slate-100" />
        </div>
      ) : null}

      {props.status === 'error' || props.status === 'empty' ? (
        <div className="mt-6 text-sm text-slate-600">{props.message}</div>
      ) : null}

      {props.status === 'success' ? (
        <div className="mt-6 flex items-end justify-between">
          <div className="text-5xl font-semibold tracking-tight">
            {formatTempC(props.weather.tempNowC)}
          </div>
        </div>
      ) : null}
    </section>
  )
}


