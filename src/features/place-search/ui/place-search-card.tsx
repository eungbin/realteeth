import { useEffect, useMemo, useRef, useState } from 'react'

import { forwardGeocodeNominatim } from '../api/forward-geocode'
import { useDistrictAutocomplete } from '../model/use-district-autocomplete'
import { useKoreaDistricts } from '../model/use-korea-districts'

export type SelectedPlace = { placeName: string; lat: number; lon: number }

type PlaceSearchCardProps = {
  value?: SelectedPlace | null
  onSelect: (place: SelectedPlace) => void
  onClear?: () => void
}

export function PlaceSearchCard(props: PlaceSearchCardProps) {
  const districts = useKoreaDistricts()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState<number>(-1)
  const [status, setStatus] = useState<'idle' | 'geocoding' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const acRef = useRef<AbortController | null>(null)

  const items = districts.status === 'success' ? districts.items : []
  const suggestions = useDistrictAutocomplete({ items, query, limit: 10 })

  const canShowList = useMemo(() => {
    return query.trim().length >= 2 && suggestions.length > 0
  }, [query, suggestions.length])

  useEffect(() => {
    return () => {
      acRef.current?.abort()
    }
  }, [])

  async function selectSuggestion(label: string) {
    setStatus('geocoding')
    setMessage(null)
    setActiveIdx(-1)

    acRef.current?.abort()
    const ac = new AbortController()
    acRef.current = ac

    // Nominatim 정확도를 위해 국가를 살짝 보강
    const queryWithCountry = `대한민국 ${label}`
    const result = await forwardGeocodeNominatim({ query: queryWithCountry, signal: ac.signal })
    if (!result) {
      setStatus('error')
      setMessage('좌표를 찾지 못했습니다. 다른 키워드로 시도해 주세요.')
      return
    }

    props.onSelect({
      placeName: label,
      lat: result.lat,
      lon: result.lon,
    })
    setStatus('idle')
    setQuery('')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-700">검색</div>
          <div className="mt-1 text-sm text-slate-500">
            검색한 장소의 날씨를 표시합니다.
          </div>
        </div>

        {props.value ? (
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => props.onClear?.()}
            aria-label="현재 위치로"
          >
            <span className="sm:hidden" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="1.5" />
                <path d="M12 2v3" />
                <path d="M12 19v3" />
                <path d="M2 12h3" />
                <path d="M19 12h3" />
              </svg>
            </span>
            <span className="hidden sm:inline">현재 위치로</span>
          </button>
        ) : null}
      </div>

      <div className="relative mt-4">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setStatus('idle')
            setMessage(null)
            setActiveIdx(-1)
          }}
          onKeyDown={(e) => {
            if (!suggestions.length) return

            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIdx((i) => Math.max(i - 1, 0))
            }
            if (e.key === 'Enter') {
              e.preventDefault()
              const s = suggestions[Math.max(0, activeIdx)]
              if (s) void selectSuggestion(s.label)
            }
            if (e.key === 'Escape') {
              setActiveIdx(-1)
            }
          }}
          disabled={districts.status === 'error'}
          placeholder={
            districts.status === 'loading'
              ? '데이터 로딩 중...'
              : districts.status === 'error'
                ? '검색 데이터를 불러오지 못했습니다.'
                : '예) 서울특별시 강남구'
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
        />

        {status === 'geocoding' ? (
          <div className="mt-2 text-xs text-slate-500">좌표를 찾는 중...</div>
        ) : null}
        {message ? <div className="mt-2 text-xs text-rose-600">{message}</div> : null}
        {canShowList ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <ul className="max-h-64 overflow-auto">
              {suggestions.map((s, idx) => {
                const active = idx === activeIdx
                return (
                  <li key={s.raw}>
                    <button
                      type="button"
                      className={
                        'flex w-full items-center justify-between px-4 py-3 text-left text-sm ' +
                        (active
                          ? 'bg-slate-50 text-slate-900'
                          : 'bg-white text-slate-800 hover:bg-slate-50')
                      }
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => void selectSuggestion(s.label)}
                    >
                      <span className="truncate">{s.label}</span>
                      <span className="ml-3 shrink-0 text-xs text-slate-400">선택</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}


