import { useEffect, useState } from 'react'

export type UseKoreaDistrictsState =
  | { status: 'loading' }
  | { status: 'success'; items: string[] }
  | { status: 'error' }

export function useKoreaDistricts(): UseKoreaDistrictsState {
  const [state, setState] = useState<UseKoreaDistrictsState>({ status: 'loading' })

  useEffect(() => {
    let mounted = true
    import('@/shared/assets/data/korea_districts.json')
      .then((mod) => {
        const items = (mod.default ?? mod) as unknown
        if (!Array.isArray(items)) throw new Error('KOREA_DISTRICTS_INVALID')
        if (mounted) setState({ status: 'success', items: items as string[] })
      })
      .catch(() => {
        if (mounted) setState({ status: 'error' })
      })
    return () => {
      mounted = false
    }
  }, [])

  return state
}


