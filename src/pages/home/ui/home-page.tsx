import { useState } from 'react'

import { useCurrentPosition } from '@/features/detect-location'
import { FavoritesCard, useFavorites, useFavoriteWeathers } from '@/features/favorites'
import { makePlaceId } from '@/features/favorites/model/storage'
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

  // 테스트/디버깅용: 검색한 장소 날씨 상태 강제
  // 예) ?debugSearchWeather=empty
  const debugSearchWeather =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('debugSearchWeather') : null

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
  const favoriteId = canFavorite ? makePlaceId(coords.lat, coords.lon) : null
  const forceSearchEmpty = Boolean(selectedPlace && debugSearchWeather === 'empty')

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

      {selectedPlace ? (
        <>
          {weatherQuery.isLoading && !forceSearchEmpty ? (
            <>
              <WeatherSummary status="loading" title="검색한 장소" />
              <WeatherHourly status="loading" />
            </>
          ) : null}

          {weatherQuery.isError || forceSearchEmpty ? (
            <>
              <WeatherSummary status="empty" title="검색한 장소" message="해당 장소의 정보가 제공되지 않습니다." />
              <WeatherHourly status="empty" message="해당 장소의 정보가 제공되지 않습니다." />
            </>
          ) : null}

          {weatherQuery.data && !forceSearchEmpty ? (
            <>
              <WeatherSummary
                status="success"
                title="검색한 장소"
                weather={{ ...weatherQuery.data, placeName }}
                placeAction={
                  <button
                    type="button"
                    disabled={!canFavorite || favorites.items.length >= favorites.limit}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    aria-pressed={isAlreadyFavorite}
                    aria-label={`${placeName} 즐겨찾기 ${isAlreadyFavorite ? '해제' : '추가'}`}
                    title={isAlreadyFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    onClick={() => {
                      setFavMessage(null)
                      if (!canFavorite || !favoriteId) return
                      if (isAlreadyFavorite) {
                        favorites.remove(favoriteId)
                        setFavMessage('즐겨찾기에서 제거했습니다.')
                        return
                      }
                      const res = favorites.add({ placeName, lat: coords.lat, lon: coords.lon })
                      if (res.ok) setFavMessage('즐겨찾기에 추가했습니다.')
                      else if (res.reason === 'limit') setFavMessage('즐겨찾기는 최대 6개까지 추가할 수 있어요.')
                      else if (res.reason === 'duplicate') setFavMessage('이미 즐겨찾기에 있습니다.')
                      else setFavMessage('즐겨찾기 저장에 실패했습니다.')
                    }}
                  >
                    <span aria-hidden="true">{isAlreadyFavorite ? '★' : '☆'}</span>
                  </button>
                }
              />
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
                  <WeatherSummary
                    status="success"
                    title="현재 위치"
                    weather={{ ...weatherQuery.data, placeName }}
                    placeAction={
                      <button
                        type="button"
                        disabled={!canFavorite || favorites.items.length >= favorites.limit}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        aria-pressed={isAlreadyFavorite}
                        aria-label={`${placeName} 즐겨찾기 ${isAlreadyFavorite ? '해제' : '추가'}`}
                        title={isAlreadyFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        onClick={() => {
                          setFavMessage(null)
                          if (!canFavorite || !favoriteId) return
                          if (isAlreadyFavorite) {
                            favorites.remove(favoriteId)
                            setFavMessage('즐겨찾기에서 제거했습니다.')
                            return
                          }
                          const res = favorites.add({ placeName, lat: coords.lat, lon: coords.lon })
                          if (res.ok) setFavMessage('즐겨찾기에 추가했습니다.')
                          else if (res.reason === 'limit') setFavMessage('즐겨찾기는 최대 6개까지 추가할 수 있어요.')
                          else if (res.reason === 'duplicate') setFavMessage('이미 즐겨찾기에 있습니다.')
                          else setFavMessage('즐겨찾기 저장에 실패했습니다.')
                        }}
                      >
                        <span aria-hidden="true">{isAlreadyFavorite ? '★' : '☆'}</span>
                      </button>
                    }
                  />
                  <WeatherHourly status="success" points={weatherQuery.data.hourlyToday} />
                </>
              ) : null}
            </>
          ) : null}
        </>
      )}

      <FavoritesCard
        items={favorites.items}
        headerMessage={favMessage}
        onSelect={(p) => {
          setSelectedPlace(p)
          setFavMessage(null)
        }}
        onRemove={(id) => {
          favorites.remove(id)
          setFavMessage(null)
        }}
        onRename={(id, nextPlaceName) => {
          setFavMessage(null)
          const res = favorites.rename(id, nextPlaceName)
          if (res.ok) setFavMessage('이름을 변경했습니다.')
          else if (res.reason === 'empty') setFavMessage('이름은 비워둘 수 없어요.')
          else setFavMessage('이름 변경에 실패했습니다.')
        }}
        weatherById={weatherById}
      />
    </section>
  )
}


