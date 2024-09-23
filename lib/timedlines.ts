import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimedLinesLine, TimelineTarget } from '@/app/cachedb/timedlines'
import { useAppSelector } from './hooks'
export { TimelineTarget }

export type TimelineItemState = TimedLinesLine

export type TimelineState = Array<TimelineItemState>

export type TimedLinesState = {
    primary: TimelineState
    secondary: TimelineState
}

const initialState: TimedLinesState = {
    primary: [],
    secondary: []
}

export const TimedLinesSlice = createSlice({
    name: 'timedlines',
    initialState,
    reducers: {
        loadAll(
            state,
            action: PayloadAction<{ primary: TimelineState; secondary: TimelineState }>
        ) {
            state.primary = action.payload.primary
            state.secondary = action.payload.secondary
        },

        add(state, action: PayloadAction<[TimelineTarget, TimelineItemState]>) {
            state[action.payload[0]].push(action.payload[1])
        },

        update(
            state,
            action: PayloadAction<[TimelineTarget, { uhash: number; content: TimelineItemState }]>
        ) {
            const idx = state[action.payload[0]].findIndex(
                (item) => item.uhash == action.payload[1].uhash
            )

            state[action.payload[0]][idx] = action.payload[1].content
        },

        remove(state, action: PayloadAction<[TimelineTarget, { uhash: number }]>) {
            state[action.payload[0]] = state[action.payload[0]].filter(
                (item) => item.uhash !== action.payload[1].uhash
            )
        }
    }
})

export const { add, update, remove, loadAll } = TimedLinesSlice.actions
export default TimedLinesSlice.reducer
