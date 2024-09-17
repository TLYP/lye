import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AudioPlayerState = {
    audio: null | {
        currentTime: number
        duration: number
        paused: boolean
        targetCurrentTimeState: {
            state: Array<[number, number]>
            counter: number
        }
        targetState: {
            state: Array<['pause' | 'play', number]>
            counter: number
        }
        src: string
    }
}
const initialState: AudioPlayerState = {
    audio: null
}

export const AudioPlayerSlice = createSlice({
    name: 'audioPlayer',
    initialState,
    reducers: {
        setCurrentTime(state, action: PayloadAction<number>) {
            state.audio?.targetCurrentTimeState.state.push([
                action.payload,
                state.audio?.targetCurrentTimeState.state.length +
                    state.audio.targetCurrentTimeState.counter
            ])
        },
        UpdateCurrentTimeTargetCounter(state, action: PayloadAction<number>) {
            if (state.audio == null) return

            state.audio.targetCurrentTimeState.counter = action.payload + 1
            state.audio.targetCurrentTimeState.state =
                state.audio.targetCurrentTimeState.state.filter((ct) => ct[1] != action.payload)
        },
        UpdateTargetStateCounter(state, action: PayloadAction<number>) {
            if (state.audio == null) return

            state.audio.targetState.counter = action.payload + 1
            state.audio.targetState.state = state.audio.targetState.state.filter(
                (ct) => ct[1] != action.payload
            )
        },

        updatePaused(state, action: PayloadAction<boolean>) {
            if (state.audio == null) return
            state.audio.paused = action.payload
        },
        updateCurrentTime(state, action: PayloadAction<number>) {
            if (state.audio == null) return
            state.audio.currentTime = action.payload
        },
        updateDuration(state, action: PayloadAction<number>) {
            if (state.audio == null) return
            state.audio.duration = action.payload
        },
        play(state) {
            state.audio?.targetState.state.push([
                'play',
                state.audio?.targetState.state.length + state.audio.targetState.counter
            ])
        },
        pause(state) {
            state.audio?.targetState.state.push([
                'pause',
                state.audio?.targetState.state.length + state.audio.targetState.counter
            ])
        },
        set(
            state,
            action: PayloadAction<Omit<
                NonNullable<AudioPlayerState['audio']>,
                'targetCurrentTimeState' | 'targetState'
            > | null>
        ) {
            if (action.payload == null) {
                state.audio = null
                return
            }

            state.audio = {
                ...action.payload,
                targetCurrentTimeState: { state: [] as any[], counter: 0 },
                targetState: { state: [] as any[], counter: 0 }
            }
        }
    }
})

export const {
    setCurrentTime,
    UpdateCurrentTimeTargetCounter,
    UpdateTargetStateCounter,
    updatePaused,
    updateCurrentTime,
    updateDuration,
    play,
    pause,
    set
} = AudioPlayerSlice.actions
export default AudioPlayerSlice.reducer
