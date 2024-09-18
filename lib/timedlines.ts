import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const TimelineTarget = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary'
} as const

export type TimelineTarget = (typeof TimelineTarget)[keyof typeof TimelineTarget]

export type TimelineItemState = {
    // the U hash or Unique Hash is a hash created by a string which combines `{lineNumber}-{lineContent}`
    uhash: number
    linenumber: number
    displayLineNumber?: number
    start: number
    end: number
}
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

export const { add, update, remove } = TimedLinesSlice.actions
export default TimedLinesSlice.reducer
