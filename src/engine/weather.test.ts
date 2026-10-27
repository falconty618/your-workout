import { describe, expect, it } from 'vitest'
import { evaluateWeather } from './weather'

const base = { fetchedAt: '2026-10-27T00:00:00.000Z', temperatureC: 20, apparentTemperatureC: 20, precipitationMm: 0, windKph: 10, weatherCode: 1 }

describe('weather thresholds', () => {
  it('does not call ordinary conditions guaranteed safe', () => {
    expect(evaluateWeather(base)).toMatchObject({ level: 'normal', reasons: [] })
  })

  it('flags configurable heat, precipitation, and wind cautions', () => {
    const result = evaluateWeather({ ...base, apparentTemperatureC: 33, precipitationMm: 4, windKph: 40 })
    expect(result.level).toBe('caution')
    expect(result.reasons).toHaveLength(3)
  })

  it('marks severe weather codes as severe', () => {
    expect(evaluateWeather({ ...base, weatherCode: 95 }).level).toBe('severe')
  })
})
