import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
    TimedLinesLine,
    TimelineTarget,
    TimedLines,
    TimedLinesReferenceTimeline,
    TimedLinesReferenceLine
} from '@/app/cachedb/timedlines'
import { Session, SessionReference } from '@/app/cachedb/sessions'
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
            Session.getActiveSession().then(async (active) => {
                if (!active) return

                const timedlines = active.timedlines

                timedlines[action.payload[0]].addLine(action.payload[1])

                await timedlines.update()
            })

            state[action.payload[0]].push(action.payload[1])
        },

        update(
            state,
            action: PayloadAction<[TimelineTarget, { uhash: number; content: TimelineItemState }]>
        ) {
            const idx = state[action.payload[0]].findIndex(
                (item) => item.uhash == action.payload[1].uhash
            )

            Session.getActiveSession().then(async (active) => {
                if (!active) return

                const timedlines = active.timedlines
                const t = action.payload[0]
                const lineIndex = timedlines[t].lines.findIndex(
                    (item) => item.uhash === action.payload[1].uhash
                )
                timedlines[t].lines[lineIndex].set(action.payload[1].content)

                await timedlines.update()
            })

            state[action.payload[0]][idx] = action.payload[1].content
        },

        remove(state, action: PayloadAction<[TimelineTarget, { uhash: number }]>) {
            Session.getActiveSession().then(async (active) => {
                if (!active) return

                const timedlines = active.timedlines
                const t = action.payload[0]

                timedlines[t].lines = timedlines[t].lines.filter(
                    (item) => item.uhash !== action.payload[1].uhash
                )

                await timedlines.update()
            })

            state[action.payload[0]] = state[action.payload[0]].filter(
                (item) => item.uhash !== action.payload[1].uhash
            )
        }
    }
})

export const { add, update, remove, loadAll } = TimedLinesSlice.actions
export default TimedLinesSlice.reducer
