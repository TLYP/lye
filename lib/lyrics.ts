import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LyricData } from '@/app/cachedb/lyrics'

export type LyricsState = {
    lyrics: Array<LyricData>
}

const initialState: LyricsState = {
    lyrics: []
}

export const LyricsSlice = createSlice({
    name: 'lyrics',
    initialState,
    reducers: {
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

export const { loadAll, addLyric, updateLyric } = LyricsSlice.actions
export default LyricsSlice.reducer
