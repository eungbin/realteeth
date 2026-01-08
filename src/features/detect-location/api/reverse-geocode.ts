type ReverseGeocodeParams = {
  lat: number
  lon: number
  signal?: AbortSignal
}

type NominatimReverseResponse = {
  display_name?: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    borough?: string
    suburb?: string
    neighbourhood?: string
    county?: string
    state?: string
    region?: string
    country?: string
  }
}

function compactJoin(parts: Array<string | undefined>, sep: string) {
  return parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter((p) => p.length > 0)
    .join(sep)
}

/**
 * 좌표를 사람이 읽을 수 있는 주소/장소명으로 변환
 */
export async function reverseGeocodeToPlaceName(
  params: ReverseGeocodeParams,
): Promise<string | undefined> {
  const url =
    'https://nominatim.openstreetmap.org/reverse?' +
    new URLSearchParams({
      format: 'jsonv2',
      lat: String(params.lat),
      lon: String(params.lon),
      zoom: '18',
      addressdetails: '1',
      'accept-language': 'ko',
    }).toString()

  const res = await fetch(url, {
    signal: params.signal,
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) return undefined

  const data = (await res.json()) as NominatimReverseResponse

  // 가능한 경우 한국식으로 구성(행정구역 + 도로명 + 번지)
  const a = data.address
  if (a) {
    const area = compactJoin(
      [a.state, a.region, a.county, a.city, a.borough, a.suburb, a.neighbourhood],
      ' ',
    )
    const road = compactJoin([a.road, a.house_number], ' ')
    const name = compactJoin([area, road], ' ')
    if (name.length > 0) return name
  }

  if (typeof data.display_name === 'string' && data.display_name.trim().length > 0) {
    return data.display_name.trim()
  }

  return undefined
}


