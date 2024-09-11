import { NextResponse } from 'next/server'
import axios from 'axios'

export type Image = {
    url: string
    width: number
    height: number
}

export type Artist = {
    name: string
    id: string
}

export type Album = {
    name: string
    id: string
    images: Image[]
    artists: Artist[]
}

export type Song = {
    name: string
    id: string
    album: Album
    track_number: number
    artists: Artist[]
}

export async function POST(request: Request) {
    const result = await request.text()

    console.log('hello')

    const req = await axios.post('http://localhost:5000/identify', result, {
        headers: {
            'Content-Type': 'text/plain'
        }
    })

    console.log('world')
    const data: { code: number; query: string; tracks: Song[] } = req.data

    if (data.code !== 0) return NextResponse.json({ code: 1 })

    return NextResponse.json({ code: 0, query: data.query, tracks: data.tracks })
}
