import { useState } from 'react'

import { useCurrentPosition } from '@/features/detect-location'
import type { SelectedPlace } from '@/features/place-search'
import { PlaceSearchCard } from '@/features/place-search'
import { useWeatherByLatLon } from '@/entities/weather'
import { WeatherHourly } from '@/widgets/weather-hourly'
import { WeatherSummary } from '@/widgets/weather-summary'

export function HomePage() {
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null)
  const pos = useCurrentPosition()

  const coords =
    selectedPlace ??
    (pos.status === 'success' ? { lat: pos.coords.lat, lon: pos.coords.lon, placeName: '현재 위치' } : null)

  const placeName = selectedPlace
    ? selectedPlace.placeName
    : pos.status === 'success'
      ? pos.placeName?.trim()
        ? pos.placeName.trim()
        : '현재 위치'
      : '현재 위치'

  const weatherQuery = useWeatherByLatLon({
    lat: coords?.lat,
    lon: coords?.lon,
    placeName,
    enabled: typeof coords?.lat === 'number' && typeof coords?.lon === 'number',
  })

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">날씨</h1>
        <p className="mt-1 text-sm text-slate-600">
          현재 위치 기반으로 오늘(00~23시) 시간대별 기온까지 표시합니다.
        </p>
      </div>

      <PlaceSearchCard
        value={selectedPlace}
        onSelect={(p) => setSelectedPlace(p)}
        onClear={() => setSelectedPlace(null)}
      />

      {selectedPlace ? (
        <>
          {weatherQuery.isLoading ? (
            <>
              <WeatherSummary status="loading" title="검색한 장소" />
              <WeatherHourly status="loading" />
            </>
          ) : null}

          {weatherQuery.isError ? (
            <>
              <WeatherSummary status="empty" title="검색한 장소" message="해당 장소의 정보가 제공되지 않습니다." />
              <WeatherHourly status="empty" message="해당 장소의 정보가 제공되지 않습니다." />
            </>
          ) : null}

          {weatherQuery.data ? (
            <>
              <WeatherSummary status="success" title="검색한 장소" weather={{ ...weatherQuery.data, placeName }} />
              <WeatherHourly status="success" points={weatherQuery.data.hourlyToday} />
            </>
          ) : null}
        </>
      ) : (
        <>
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
                  <WeatherHourly status="empty" message="해당 장소의 정보가 제공되지 않습니다." />
                </>
              ) : null}

              {weatherQuery.data ? (
                <>
                  <WeatherSummary status="success" title="현재 위치" weather={{ ...weatherQuery.data, placeName }} />
                  <WeatherHourly status="success" points={weatherQuery.data.hourlyToday} />
                </>
              ) : null}
            </>
          ) : null}
        </>
      )}

      <div className="grid gap-4 grid-cols-1">
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


