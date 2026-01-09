import { useState } from 'react'

import { useCurrentPosition } from '@/features/detect-location'
import { FavoritesCard, useFavorites, useFavoriteWeathers } from '@/features/favorites'
import type { SelectedPlace } from '@/features/place-search'
import { PlaceSearchCard } from '@/features/place-search'
import { useWeatherByLatLon } from '@/entities/weather'
import { WeatherHourly } from '@/widgets/weather-hourly'
import { WeatherSummary } from '@/widgets/weather-summary'

export function HomePage() {
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null)
  const [favMessage, setFavMessage] = useState<string | null>(null)
  const pos = useCurrentPosition()
  const favorites = useFavorites()
  const { weatherById } = useFavoriteWeathers({ items: favorites.items })

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

  const canFavorite = typeof coords?.lat === 'number' && typeof coords?.lon === 'number'
  const isAlreadyFavorite = canFavorite ? favorites.isFavorite(coords.lat, coords.lon) : false

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
        onClear={() => {
          setSelectedPlace(null)
          setFavMessage(null)
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={!canFavorite || isAlreadyFavorite || favorites.items.length >= favorites.limit}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          onClick={() => {
            setFavMessage(null)
            if (!canFavorite) return
            const res = favorites.add({ placeName, lat: coords.lat, lon: coords.lon })
            if (res.ok) {
              setFavMessage('즐겨찾기에 추가했습니다.')
              return
            }
            if (res.reason === 'limit') setFavMessage('즐겨찾기는 최대 6개까지 추가할 수 있어요.')
            else if (res.reason === 'duplicate') setFavMessage('이미 즐겨찾기에 있습니다.')
            else setFavMessage('즐겨찾기 저장에 실패했습니다.')
          }}
        >
          즐겨찾기 추가
        </button>
        {favMessage ? <div className="text-xs text-slate-600">{favMessage}</div> : null}
      </div>

      <FavoritesCard
        items={favorites.items}
        onSelect={(p) => {
          setSelectedPlace(p)
          setFavMessage(null)
        }}
        onRemove={(id) => {
          favorites.remove(id)
          setFavMessage(null)
        }}
        weatherById={weatherById}
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

      {/* 즐겨찾기 카드/기능을 위에서 구현 */}
    </section>
  )
}


