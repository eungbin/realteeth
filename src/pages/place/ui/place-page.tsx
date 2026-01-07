import { Link, useParams } from 'react-router-dom'

export function PlacePage() {
  const { placeId } = useParams()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">상세</h1>
        <Link className="text-sm text-sky-700 hover:underline" to="/">
          홈으로
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-slate-600">placeId</div>
        <div className="mt-1 font-mono text-sm text-slate-900">{placeId}</div>
        <div className="mt-3 text-slate-500">
          2~4단계에서 좌표 확정(현재 위치/검색/즐겨찾기) → 해당 좌표의 날씨 상세를
          표시합니다.
        </div>
      </div>
    </section>
  )
}


