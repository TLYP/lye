import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type DragToTimelineState = {
    active?: {
        uhash: number
        linenumber: number
    }
}

const initialState: DragToTimelineState = {}

export const LyricsSlice = createSlice({
    name: 'dragtotimeline',
    initialState,
    reducers: {
        setActive(state, action: PayloadAction<{ uhash: number; linenumber: number }>) {
            state.active = action.payload
        },
        clearActive(state) {
            state.active = undefined
        }
    }
})

export const { setActive, clearActive } = LyricsSlice.actions
export default LyricsSlice.reducer
