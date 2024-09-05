import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type LyricsState = {
    musicUrl: string | null
    fileName: string | null
}

const initialState: LyricsState = {
    musicUrl: null,
    fileName: null
}

export const LyricsSlice = createSlice({
    name: 'localAudio',
    initialState,
    reducers: {
        setMusicUrl: (state, action: PayloadAction<string | null>) => {
            state.musicUrl = action.payload
        }
    }
})

export const { setMusicUrl } = LyricsSlice.actions
export default LyricsSlice.reducer
