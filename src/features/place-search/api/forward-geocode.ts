export type ForwardGeocodeResult = {
  lat: number
  lon: number
  displayName?: string
}

type NominatimSearchItem = {
  lat?: string
  lon?: string
  display_name?: string
}

export async function forwardGeocodeNominatim(params: {
  query: string
  signal?: AbortSignal
}): Promise<ForwardGeocodeResult | undefined> {
  const q = params.query.trim()
  if (!q) return undefined

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({
      format: 'jsonv2',
      q,
      limit: '1',
      addressdetails: '1',
      'accept-language': 'ko',
      countrycodes: 'kr',
    }).toString()

  const res = await fetch(url, {
    signal: params.signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return undefined

  const data = (await res.json()) as NominatimSearchItem[]
  const first = data?.[0]
  if (!first) return undefined

  const lat = typeof first.lat === 'string' ? Number(first.lat) : NaN
  const lon = typeof first.lon === 'string' ? Number(first.lon) : NaN
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined

  return { lat, lon, displayName: first.display_name }
}
