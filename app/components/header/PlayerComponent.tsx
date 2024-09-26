import PlayIcon from '../icons/play'
import PauseIcon from '../icons/pause'
import * as AudioPlayerActions from '@/lib/audioplayer'
import { useEffect, useState } from 'react'
import { Session, SessionReference } from '@/app/cachedb/sessions'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'

// Used to handle update states from anywhere, particularly currentTime, and Paused states
function ComponentComplexStateHandler({ audio }: { audio: HTMLAudioElement | null }) {
    const dispatch = useAppDispatch()
    const audioTargetCurrentTime = useAppSelector(
        (state) => state.audioPlayer.audio?.targetCurrentTimeState.state
    )
    const audioTargetCurrentTimeCounter = useAppSelector(
        (state) => state.audioPlayer.audio?.targetCurrentTimeState.counter
    )

    const audioTargetState = useAppSelector((state) => state.audioPlayer.audio?.targetState.state)
    const audioTargetStateCounter = useAppSelector(
        (state) => state.audioPlayer.audio?.targetState.counter
    )

    useEffect(() => {
        if (audio == null || audioTargetCurrentTime == null || audioTargetCurrentTime.length == 0)
            return
        const target = audioTargetCurrentTime[0]
        if (target[1] != audioTargetCurrentTimeCounter) return

        dispatch(AudioPlayerActions.UpdateCurrentTimeTargetCounter(target[1]))
        dispatch(AudioPlayerActions.updateCurrentTime(target[0]))
        audio.currentTime = target[0]
    }, [audioTargetCurrentTime, audioTargetCurrentTimeCounter])

    useEffect(() => {
        if (audio == null || audioTargetState == null || audioTargetState.length == 0) return
        const target = audioTargetState[0]
        if (target[1] != audioTargetStateCounter) return

        dispatch(AudioPlayerActions.UpdateTargetStateCounter(target[1]))
        dispatch(AudioPlayerActions.updatePaused(target[0] == 'pause'))
        if (target[0] == 'pause') audio.pause()
        else audio.play()
    }, [audioTargetState, audioTargetStateCounter])

    return <></>
}

export default function Component() {
    const sessionSerial = useAppSelector((state) => state.sessions.activeSession)

    const dispatch = useAppDispatch()
    const duration = useAppSelector((state) => state.audioPlayer.audio?.duration ?? 0)
    const currentTime = useAppSelector((state) => state.audioPlayer.audio?.currentTime ?? 0)
    const paused = useAppSelector((state) => state.audioPlayer.audio?.paused)

    const [session, setSesson] = useState<SessionReference | null>(null)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (sessionSerial == null) return
        ;(async () => {
            setSesson(await Session.get(sessionSerial.uuid))
        })()
    }, [sessionSerial])

    useEffect(() => {
        if (session == null) return

        const naudio = new Audio()
        naudio.src = session.file.dataURI
        let tval: NodeJS.Timeout | null = null

        naudio.onloadeddata = () => {
            dispatch(AudioPlayerActions.updateDuration(naudio.duration))
        }

        tval = setInterval(() => {
            if (naudio.paused) return
            // return
            dispatch(AudioPlayerActions.updateCurrentTime(naudio.currentTime))
        }, 50)

        naudio.onplay = () => {
            dispatch(AudioPlayerActions.updatePaused(false))
        }
        naudio.onpause = () => {
            dispatch(AudioPlayerActions.updatePaused(true))
        }

        setAudio(naudio)
        dispatch(
            AudioPlayerActions.set({
                currentTime: naudio.currentTime,
                duration: naudio.duration,
                paused: naudio.paused,
                src: naudio.src
            })
        )

        return () => {
            naudio.pause()
            setAudio(null)
            dispatch(AudioPlayerActions.set(null))
            if (tval) clearInterval(tval)
        }
    }, [session])

    if (session == null) return <></>

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changecurrenttime = (event: any) => {
        const element = document.getElementById('player-onclick-element')
        if (!audio || !element) return
        const rect = element.getBoundingClientRect()
        const ctime = event.clientX - rect.left
        const time = (ctime / rect.width) * duration
        dispatch(AudioPlayerActions.setCurrentTime(time))
    }

    return (
        <div className="flex w-full">
            <ComponentComplexStateHandler audio={audio} />
            <div
                onClick={() => {
                    if (paused) dispatch(AudioPlayerActions.play())
                    else dispatch(AudioPlayerActions.pause())
                }}
                className="flex justify-center items-center min-w-12 h-12 cursor-pointer"
            >
                {!paused ? (
                    <PauseIcon className="fill-accent-100" />
                ) : (
                    <PlayIcon className="fill-accent-100" />
                )}
            </div>

            <div className="flex flex-col min-w-[300px] h-12 ">
                <div className="flex items-end min-w-full h-6 ">
                    <span className="text-text-100">{session?.name}</span>
                </div>
                <div
                    onClick={(e) => changecurrenttime(e)}
                    id="player-onclick-element"
                    className="flex items-center w-full h-6 cursor-pointer"
                >
                    <div className="flex items-center w-full h-4 ">
                        <div className="w-full h-1 bg-primary-700">
                            <div
                                className="h-1 bg-secondary-300"
                                style={{
                                    width: (currentTime / duration) * 100 + `%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
