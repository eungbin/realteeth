import { useCurrentPosition } from '@/features/detect-location'
import { useWeatherByLatLon } from '@/entities/weather'
import { WeatherHourly } from '@/widgets/weather-hourly'
import { WeatherSummary } from '@/widgets/weather-summary'

export function HomePage() {
  const pos = useCurrentPosition()

  const weatherQuery = useWeatherByLatLon({
    lat: pos.status === 'success' ? pos.coords.lat : undefined,
    lon: pos.status === 'success' ? pos.coords.lon : undefined,
    placeName: '현재 위치',
    enabled: pos.status === 'success',
  })

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">날씨</h1>
        <p className="mt-1 text-sm text-slate-600">
          현재 위치 기반으로 오늘(00~23시) 시간대별 기온까지 표시합니다.
        </p>
      </div>

      {pos.status === 'loading' || pos.status === 'idle' ? (
        <>
          <WeatherSummary status="loading" title="현재 위치" />
          <WeatherHourly status="loading" />
        </>
      ) : null}

      {pos.status === 'error' ? (
        <>
          <WeatherSummary status="error" title="현재 위치" message={pos.message} />
          <WeatherHourly status="empty" message="위치가 없어 시간대별 기온을 표시할 수 없습니다." />
        </>
      ) : null}

      {pos.status === 'success' ? (
        <>
          {weatherQuery.isLoading ? (
            <>
              <WeatherSummary status="loading" title="현재 위치" />
              <WeatherHourly status="loading" />
            </>
          ) : null}

          {weatherQuery.isError ? (
            <>
              <WeatherSummary
                status="empty"
                title="현재 위치"
                message="해당 장소의 정보가 제공되지 않습니다."
              />
              <WeatherHourly
                status="empty"
                message="해당 장소의 정보가 제공되지 않습니다."
              />
            </>
          ) : null}

          {weatherQuery.data ? (
            <>
              <WeatherSummary status="success" title="현재 위치" weather={weatherQuery.data} />
              <WeatherHourly status="success" points={weatherQuery.data.hourlyToday} />
            </>
          ) : null}
        </>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-700">검색(다음 단계)</div>
          <div className="mt-2 text-slate-500">
            korea_districts.json 기반 자동완성 → 지오코딩으로 좌표 보강 → 동일한 방식으로
            날씨를 조회합니다.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-700">즐겨찾기(다음 단계)</div>
          <div className="mt-2 text-slate-500">
            최대 6개 카드 등록 후, 각 카드에서 현재/최저/최고를 보여주고 상세로 이동합니다.
          </div>
        </div>
      </div>
    </section>
  )
}


