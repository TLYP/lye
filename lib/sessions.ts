import { SessionReference, SessionData } from '@/app/cachedb/sessions'

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SessionListState = {
    sessions: Array<SessionData>
    activeSession: SessionData | null
}

const initialState: SessionListState = {
    sessions: [],
    activeSession: null
}

const SessionListSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        loadAll: (state, action: PayloadAction<Array<SessionData>>) => {
            state.sessions = action.payload
        },
        addSession: (state, action: PayloadAction<SessionData>) => {
            state.sessions.push(action.payload)
        },
        setActiveSession: (state, action: PayloadAction<SessionData | null>) => {
            state.activeSession = action.payload
        }
    }
})

export const { loadAll, addSession, setActiveSession } = SessionListSlice.actions
export default SessionListSlice.reducer
