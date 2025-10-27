import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const city = searchParams.get('city')

    const apiKey = process.env.WEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 })
    }

    let query = ''
    if (lat && lon) {
      query = `${lat},${lon}`
    } else if (city) {
      query = city
    } else {
      query = 'New Delhi'
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}&aqi=no`
    const resp = await fetch(url)

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Upstream error', details: text }, { status: resp.status })
    }

    const data = await resp.json()

    // Map WeatherAPI response to UI-friendly shape
    const temperature = data.current?.temp_c != null ? `${data.current.temp_c}°C` : null
    const humidity = data.current?.humidity != null ? `${data.current.humidity}%` : null
    const rainfall = data.current?.precip_mm != null ? `${data.current.precip_mm}mm` : '0mm'
    const condition = data.current?.condition?.text || null
    const locationName = data.location?.name || query  // <- add city name here

    return NextResponse.json({ temperature, humidity, rainfall, condition, city: locationName, raw: data })
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
