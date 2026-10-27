import type { LocationPreference, WeatherSnapshot } from '../domain'

interface OpenMeteoCurrent {
  time: string
  temperature_2m: number
  apparent_temperature: number
  precipitation: number
  weather_code: number
  wind_speed_10m: number
}

export function evaluateWeather(input: Omit<WeatherSnapshot, 'level' | 'reasons'>): WeatherSnapshot {
  const reasons: string[] = []
  let level: WeatherSnapshot['level'] = 'normal'
  if (input.apparentTemperatureC >= 32) { level = 'caution'; reasons.push('High apparent temperature') }
  if (input.apparentTemperatureC <= -5) { level = 'caution'; reasons.push('Very cold apparent temperature') }
  if (input.precipitationMm >= 3) { level = 'caution'; reasons.push('Meaningful precipitation') }
  if (input.windKph >= 35) { level = 'caution'; reasons.push('Strong wind') }
  if (input.apparentTemperatureC >= 38 || input.windKph >= 55 || input.weatherCode >= 95) {
    level = 'severe'
    reasons.push('Potentially severe conditions')
  }
  return { ...input, level, reasons }
}

export async function fetchWeather(location: LocationPreference, signal?: AbortSignal): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    temperature_unit: 'celsius', wind_speed_unit: 'kmh', precipitation_unit: 'mm', timezone: 'auto',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
  if (!response.ok) throw new Error('Weather is unavailable right now.')
  const data = await response.json() as { current?: OpenMeteoCurrent }
  if (!data.current) throw new Error('Weather response did not include current conditions.')
  return evaluateWeather({
    fetchedAt: new Date().toISOString(), temperatureC: data.current.temperature_2m,
    apparentTemperatureC: data.current.apparent_temperature, precipitationMm: data.current.precipitation,
    windKph: data.current.wind_speed_10m, weatherCode: data.current.weather_code,
  })
}

export async function searchLocation(query: string, signal?: AbortSignal): Promise<LocationPreference> {
  const params = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' })
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal })
  if (!response.ok) throw new Error('Location search is unavailable.')
  const data = await response.json() as { results?: Array<{ name: string; country?: string; admin1?: string; latitude: number; longitude: number }> }
  const result = data.results?.[0]
  if (!result) throw new Error('No matching location was found. Try a city and country.')
  return {
    source: 'manual', label: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
    latitude: Number(result.latitude.toFixed(2)), longitude: Number(result.longitude.toFixed(2)), updatedAt: new Date().toISOString(),
  }
}
