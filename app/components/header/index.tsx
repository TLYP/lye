'use client'
import { useEffect, useState } from 'react'
import PlayIcon from '../icons/play'
import PauseIcon from '../icons/pause'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../lib/store'
import SourceSelect from './sourceSelect'
import { Session, SessionReference } from '@/app/cachedb/sessions'
import { useAppDispatch } from '@/lib/hooks'
import * as Sessions from '@/lib/sessions'
import * as Lyrics from '@/lib/lyrics'
import { Lyric } from '@/app/cachedb/lyrics'
import Link from 'next/link'

function StageChip({ name, path }: { name: string; path: string }) {
    return (
        <Link
            href={path}
            className="flex justify-center items-center w-28 h-8 bg-background-900  rounded-md"
        >
            <span className="text-text-500 text-sm font-bold">{name}</span>
        </Link>
    )
}

function Player() {
    const sessionSerial = useSelector((state: RootState) => state.sessions.activeSession)
    const [session, setSesson] = useState<SessionReference | null>(null)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
    const [paused, setPaused] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(1)

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
            setDuration(naudio.duration)
        }

        tval = setInterval(() => {
            if (naudio.paused) return
            setCurrentTime(naudio.currentTime)
        }, 50)

        naudio.onplay = () => setPaused(true)
        naudio.onpause = () => setPaused(false)

        setAudio(naudio)

        return () => {
            naudio.pause()
            setAudio(null)
            setCurrentTime(0)
            if (tval) clearInterval(tval)
        }
    }, [session])

    if (session == null) return <></>

    const changecurrenttime = (event: any) => {
        if (!audio) return
        const target = event.target as HTMLDivElement
        const rect = target.getBoundingClientRect()
        const ctime = event.clientX - rect.left
        const time = (ctime / rect.width) * duration
        setCurrentTime(time)
        audio.currentTime = time
    }

    return (
        <div className="flex w-full">
            <div
                onClick={() => {
                    if (audio?.paused) audio?.play()
                    else audio?.pause()
                }}
                className="flex justify-center items-center min-w-12 h-12 cursor-pointer"
            >
                {paused ? (
                    <PauseIcon className="fill-accent-100" />
                ) : (
                    <PlayIcon className="fill-accent-100" />
                )}
            </div>

            <div className="flex flex-col min-w-[500px] h-12 ">
                <div className="flex items-end min-w-full h-6 ">
                    <span className="text-text-100">{session?.name}</span>
                </div>
                <div
                    onClick={(e) => changecurrenttime(e)}
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

export default function Header() {
    const dispatch = useAppDispatch()
    console.log('hello world')
    useEffect(() => {
        ;(async () => {
            const session = await Session.getActiveSession()
            if (!session) return

            dispatch(Sessions.loadAll((await Session.getAll()).map((i) => i.serialize())))
            dispatch(Sessions.setActiveSession(session.serialize()))
            dispatch(Lyrics.loadAll((await Lyric.getAll()).map((i) => i.serialize())))
        })()
    })

    return (
        <div className="flex bg-background-base border-b-2 border-background-900">
            <SourceSelect />
            <div className="flex w-full h-12">
                <Player />
            </div>
            <div className="flex items-center gap-6 h-12 px-16 ">
                <StageChip path="/metadata" name="Metadata" />
                <StageChip path="/lyrics" name="Add Lyrics" />
                <StageChip path="/timedlines" name="Timed Lines" />
                <StageChip path="/timedlyrics" name="Timed Lyrics" />
            </div>
        </div>
    )
}
