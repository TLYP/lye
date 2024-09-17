import { configureStore } from '@reduxjs/toolkit'
import LyricsReducer from './lyrics'
import MetadataReducer from './metadata'
import SessionsReducer from './sessions'
import TimedLinesReducer from './timedlines'
import DragToTimelineReducer from './local/dragToTimeline'
import AudioPlayerReducer from './audioplayer'

export const makeStore = () => {
    return configureStore({
        reducer: {
            lyrics: LyricsReducer,
            metadata: MetadataReducer,
            timedLines: TimedLinesReducer,
            sessions: SessionsReducer,
            dragToTimeline: DragToTimelineReducer,
            audioPlayer: AudioPlayerReducer
        }
    })
}

export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
