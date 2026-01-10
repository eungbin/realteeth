import { useState } from 'react'
import type { ReactNode } from 'react'

import type { FavoritePlace } from '../model/types'
import type { FavoriteWeatherSummaryState } from '../model/weather-summary'

import { formatTempC } from '@/shared/lib/format'

type FavoritesCardProps = {
  items: FavoritePlace[]
  headerAction?: ReactNode
  headerMessage?: ReactNode
  /**
   * 즐겨찾기 항목별 "요약 날씨" 표시용 데이터(조회 로직은 외부에서 주입)
   * - key: FavoritePlace.id
   */
  weatherById?: Record<string, FavoriteWeatherSummaryState | undefined>
  onSelect: (p: { placeName: string; lat: number; lon: number }) => void
  onRemove: (id: string) => void
  onRename: (id: string, nextPlaceName: string) => void
}

export function FavoritesCard(props: FavoritesCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState<string>('')

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-700">즐겨찾기</div>
          <div className="mt-1 text-sm text-slate-500">최대 6개까지 저장할 수 있어요.</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {props.headerAction ? <div>{props.headerAction}</div> : null}
          <div className="text-xs text-slate-500">{props.items.length} / 6</div>
        </div>
      </div>
      {props.headerMessage ? <div className="mt-2 text-xs text-slate-600">{props.headerMessage}</div> : null}

      {props.items.length === 0 ? (
        <div className="mt-4 text-sm text-slate-600">아직 즐겨찾기가 없습니다.</div>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {props.items.map((it) => (
            <div
              key={it.id}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                {editingId === it.id ? (
                  <form
                    className="flex min-w-0 flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const next = draftName.trim()
                      if (!next) return
                      props.onRename(it.id, next)
                      setEditingId(null)
                      setDraftName('')
                    }}
                  >
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-slate-300"
                      placeholder="이름 수정"
                      aria-label={`${it.placeName} 이름 수정`}
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      disabled={!draftName.trim()}
                      title="저장"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setEditingId(null)
                        setDraftName('')
                      }}
                      title="취소"
                    >
                      취소
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-900 hover:underline"
                      onClick={() => props.onSelect({ placeName: it.placeName, lat: it.lat, lon: it.lon })}
                      title={it.placeName}
                    >
                      {it.placeName}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setEditingId(it.id)
                          setDraftName(it.placeName)
                        }}
                        aria-label={`${it.placeName} 이름 수정`}
                        title="이름 수정"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => props.onRemove(it.id)}
                        aria-label={`${it.placeName} 삭제`}
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(() => {
                  const w = props.weatherById?.[it.id]
                  if (!w || w.status === 'loading') {
                    return (
                      <>
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <div className="text-[11px] text-slate-500">현재</div>
                          <div className="mt-1 h-5 w-10 animate-pulse rounded bg-slate-200" />
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <div className="text-[11px] text-slate-500">최저</div>
                          <div className="mt-1 h-5 w-10 animate-pulse rounded bg-slate-200" />
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <div className="text-[11px] text-slate-500">최고</div>
                          <div className="mt-1 h-5 w-10 animate-pulse rounded bg-slate-200" />
                        </div>
                      </>
                    )
                  }

                  if (w.status === 'error') {
                    return (
                      <div className="col-span-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        날씨 정보를 불러오지 못했습니다.
                      </div>
                    )
                  }

                  return (
                    <>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <div className="text-[11px] text-slate-500">현재</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          {formatTempC(w.tempNowC)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <div className="text-[11px] text-slate-500">최저</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          {formatTempC(w.tempMinTodayC)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <div className="text-[11px] text-slate-500">최고</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          {formatTempC(w.tempMaxTodayC)}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}


