import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type LyricsState = {}

const initialState: LyricsState = {}

export const LyricsSlice = createSlice({
    name: 'lyrics',
    initialState,
    reducers: {}
})

export const {} = LyricsSlice.actions
export default LyricsSlice.reducer
