import { createSlice } from '@reduxjs/toolkit'

export type TimedLyrics = {
    lyrics: []
}

const initialState: TimedLyrics = {
    lyrics: []
}

export const TimedLyricsSlice = createSlice({
    name: 'timedlyrics',
    initialState,
    reducers: {}
})

export const {} = TimedLyricsSlice.actions
export default TimedLyricsSlice.reducer
