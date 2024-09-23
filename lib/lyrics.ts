import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LyricData } from '@/app/cachedb/lyrics'
import { useAppDispatch, useAppSelector } from './hooks'

export type LyricsState = {
    active: [number, string][]
    lyrics: Array<LyricData>
}

const initialState: LyricsState = {
    active: [],
    lyrics: []
}

export const LyricsSlice = createSlice({
    name: 'lyrics',
    initialState,
    reducers: {
        setActive: (state, actions: PayloadAction<Array<[number, string]>>) => {
            state.active = actions.payload
        },
        loadAll: (state, action: PayloadAction<Array<LyricData>>) => {
            state.lyrics = action.payload
        },
        addLyric: (state, action: PayloadAction<LyricData>) => {
            state.lyrics.push(action.payload)
        },
        updateLyric: (state, action: PayloadAction<LyricData>) => {
            const idx = state.lyrics.findIndex((lyric) => lyric.uuid == action.payload.uuid)
            if (idx == -1) return
            state.lyrics[idx] = action.payload
        }
    }
})

export const { setActive, loadAll, addLyric, updateLyric } = LyricsSlice.actions
export default LyricsSlice.reducer

// export function LoadFromSession() {
//     const dispatch = useAppDispatch()
//     const activeSession = useAppSelector((state) => state.sessions.activeSession)
//     const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
//
//     if (everyLyrics == null) return console.log('no lyrics')
//     const lyric = everyLyrics.find((i) => i.uuid == activeSession?.lyricRef)
//     if (!lyric) return console.log('no lyric')
//
//     let data = lyric.lines.map((i) => i['content'])
//     let ndata = data.map((item, i) => [i + 1, item]) as Array<[number, string]>
//     ndata = ndata.filter((item) => !item[1].startsWith('['))
//     ndata = ndata.filter((item) => !(item[1].trim() === ''))
//
//     dispatch(LyricsSlice.actions.setActive(ndata))
// }
