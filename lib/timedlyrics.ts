import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimedLyricLineData, TimedLyricLineItemData } from '@/app/cachedb/timedlyrics'

export type TimedLyricsState = {
    activeLine: number | null
    lines: Record<number, TimedLyricLineData>
}

const initialState: TimedLyricsState = {
    activeLine: null,
    lines: {}
}

export const TimedLyricsSlice = createSlice({
    name: 'timedlyrics',
    initialState,
    reducers: {
        loadAll(state, action: PayloadAction<Record<number, TimedLyricLineData>>) {
            state.lines = action.payload
        },
        setActive(state, action: PayloadAction<number | null>) {
            state.activeLine = action.payload
        },
        update(state, action: PayloadAction<{ index: number; content: TimedLyricLineItemData }>) {
            if (!state.activeLine) return
            const line = state.lines[state.activeLine]
            if (!line) return
            line[action.payload.index] = action.payload.content
        },
        add(state, action: PayloadAction<{ atIndex: number; content: TimedLyricLineItemData }>) {
            if (!state.activeLine) return
            let line = state.lines[state.activeLine]
            if (!line) return
            line = [
                ...line.slice(0, action.payload.atIndex),
                action.payload.content,
                ...line.slice(action.payload.atIndex)
            ]
        },
        remove(state, action: PayloadAction<{ index: number }>) {
            if (!state.activeLine) return
            const line = state.lines[state.activeLine]
            if (!line) return
            line.splice(action.payload.index, 1)
            // state.lines.set(state.activeLine, line)
        }
    }
})

export const { loadAll, setActive, update, add, remove } = TimedLyricsSlice.actions
export default TimedLyricsSlice.reducer
