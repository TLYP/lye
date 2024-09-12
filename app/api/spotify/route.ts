import axios from 'axios'
import { NextResponse } from 'next/server'
import { Song } from '../identify/route'

export async function GET(request: Request) {
    const query = new URL(request.url).searchParams.get('query') ?? ''

    const req = await axios.get(
        'http://localhost:5000/spotify_search?q=' + encodeURIComponent(query)
    )

    const data: { code: number; query: string; tracks: Song[] } = req.data

    if (data.code !== 0) return NextResponse.json({ code: 1 })

    return NextResponse.json({ code: 0, query: data.query, tracks: data.tracks })
}
