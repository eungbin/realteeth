import { useEffect, useState } from 'react'

import { reverseGeocodeToPlaceName } from '../api/reverse-geocode'

type Coords = { lat: number; lon: number }

type UseCurrentPositionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: Coords; placeName?: string }
  | { status: 'error'; message: string }

export function useCurrentPosition() {
  const [state, setState] = useState<UseCurrentPositionState>(() => {
    if (typeof navigator === 'undefined') return { status: 'idle' }
    if (!('geolocation' in navigator)) {
      return {
        status: 'error',
        message: '이 브라우저에서는 위치 기능을 지원하지 않습니다.',
      }
    }
    return { status: 'loading' }
  })

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    if (!('geolocation' in navigator)) return
    const ac = new AbortController()
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        setState({
          status: 'success',
          coords,
        })
        reverseGeocodeToPlaceName({ ...coords, signal: ac.signal })
          .then((placeName) => {
            if (!placeName) return
            setState((prev) => {
              if (prev.status !== 'success') return prev
              return { ...prev, placeName }
            })
          })
          .catch(() => {
            // 무시하고 좌표만 유지
          })
      },
      (err) => {
        // err.code: 1(permission denied), 2(position unavailable), 3(timeout)
        const message =
          err.code === 1
            ? '위치 권한이 필요합니다. 검색으로 조회해 주세요.'
            : '현재 위치를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.'
        setState({ status: 'error', message })
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    )

    return () => {
      ac.abort()
    }
  }, [])

  return state
}


