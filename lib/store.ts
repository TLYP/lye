import { configureStore } from '@reduxjs/toolkit'
import LyricsReducer from './lyrics'
import MetadataReducer from './metadata'
import LocalaudioReducer from './localAudio'

export const makeStore = () => {
    return configureStore({
        reducer: { lyrics: LyricsReducer, metadata: MetadataReducer, localaudio: LocalaudioReducer }
    })
}

export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
