'use client'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useState, useEffect, useRef } from 'react'
import * as Lyrics from '@/lib/lyrics'
import { TimedLines } from '../cachedb/timedlines'

function formattedMS(milliseconds: number) {
    let ms = Math.round(milliseconds) % 1000
    let seconds = Math.floor((milliseconds / 1000) % 60)
    let minutes = Math.floor(milliseconds / 1000 / 60)

    let fms = ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms

    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}.${fms}`
}

function LyricsView({ activeLyric }: { activeLyric: Array<[number, string]> }) {
    return (
        <>
            <div className="rounded bg-background-900">
                {activeLyric.map((_, idx) => (
                    <div
                        className="border-background-950 w-[44px] border-y-[1px] flex cursor-default"
                        key={idx}
                    >
                        <div className="flex items-center justify-center p-2 px-4 h-[44px] w-full">
                            <span className="text-text-300">{idx + 1}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((i, idx) => (
                    <div
                        className="border-background-950 border-y-[1px] flex w-full cursor-default"
                        key={idx}
                    >
                        <div className="p-2 px-4 h-[44px] ">
                            <span className="text-text-300">--:--.---</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded bg-background-900">
                {activeLyric.map((item, idx) => (
                    <div
                        className="border-background-950 border-y-[1px] flex w-full cursor-pointer hover:bg-background-800"
                        key={idx}
                    >
                        <div className="p-2 px-4">
                            <span className="text-xl text-text-300">{item[1]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded bg-background-900">
                {activeLyric.map((_, idx) => (
                    <div
                        className="border-background-950 border-y-[1px] flex w-full cursor-default"
                        key={idx}
                    >
                        <div className="p-2 h-[44px] px-4">
                            <span className="text-text-300">--:--.---</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((i, idx) => (
                    <div
                        className="border-background-950 w-[44px] border-y-[1px] flex cursor-default"
                        key={idx}
                    >
                        <div className="flex items-center justify-center p-2 px-4 h-[44px] w-full">
                            <span className="text-text-300">{i[0]}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

function FocusEditorViewTimelineDetails({
    duration,
    divwidth
}: {
    duration: number
    divwidth: number
}) {
    return (
        <div className="relative flex w-full">
            {Array.from({
                length: Math.floor(duration / 1000)
            }).map((_, i) => (
                <>
                    {i % 5 == 0 ? (
                        <div
                            key={i}
                            className="flex justify-center absolute min-w-[1px] h-0 bg-text-400 opacity-55"
                            style={{
                                left: i * (divwidth / Math.floor(duration / 1000)) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[1px] h-1 bg-text-400 z-50 opacity-95"></div>
                            <div className="-top-0.5 absolute min-w-[1px] h-2  z-50 ">
                                <span className="text-xs text-text-400">
                                    {formattedMS((i / Math.floor(duration / 1000)) * duration)}
                                </span>
                            </div>
                            <div className="absolute min-w-[1px] h-24 bg-text-800 opacity-55"></div>
                        </div>
                    ) : (
                        <div
                            key={i}
                            className="absolute flex min-w-[1px] h-0 opacity-40"
                            style={{
                                left: i * (divwidth / Math.floor(duration / 1000)) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[1px] h-2 bg-text-800 z-50"></div>
                            <div className="absolute min-w-[1px] h-24 bg-text-700 opacity-10"></div>
                        </div>
                    )}
                </>
            ))}
        </div>
    )
}

function FocusEditorView({
    timedlines
}: {
    timedlines: Array<{ start: number; end: number; uhash: number }>
}) {
    const state = useRef<HTMLDivElement>()
    const [width, setWidth] = useState(0)
    const [duration, _] = useState(60 * 1000)

    useEffect(() => {
        if (!state.current) return

        setWidth(state.current.getBoundingClientRect().width)
    }, [state])

    return (
        <div className="flex flex-col grow bg-background-800 bg-gradient-to-b from-background-950 to-45% to-background-900 overflow-x-scroll">
            <div className="flex flex-col grow relative w-[4000px]">
                <div className="left-[900px] top-0 w-[2px] h-full bg-text-800 opacity-85 absolute z-50"></div>
                <div className="flex justify-between h-4 w-full" ref={state as any}>
                    <FocusEditorViewTimelineDetails duration={duration} divwidth={width} />
                </div>
                <div className="h-7 flex relative grow w-full py-1">
                    {timedlines.map((item, i) => (
                        <div
                            key={i}
                            className="cursor-pointer border-text-800 border-[1px] absolute rounded flex justify-center px-8 items-center bg-background-800 h-8"
                            style={{
                                width: ((item.end - item.start) / duration) * width + 'px',
                                left: (item.start / duration) * width + 'px'
                            }}
                        >
                            <span className="text-text-400 select-none">--:--</span>
                        </div>
                    ))}
                </div>
                <div className="h-7 flex relative grow w-full py-1"></div>
            </div>
        </div>
    )
}

export default function Page() {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
    const [activeLyric, setActiveLyric] = useState<Array<[number, string]>>([])
    const [timedlines, setTimedlines] = useState<
        Array<{ start: number; end: number; uhash: number }>
    >([
        {
            start: 1 * 1000,
            end: 10 * 1000,
            uhash: 0
        },
        {
            start: 11 * 1000,
            end: 13 * 1000,
            uhash: 0
        },
        {
            start: 14 * 1000,
            end: 16 * 1000,
            uhash: 0
        },
        {
            start: 17 * 1000,
            end: 21 * 1000,
            uhash: 0
        }
    ])
    const [timedlinessec, setTimedlinessec] = useState<Array<{ start: number; end: number }>>([])

    useEffect(() => {
        if (everyLyrics == null) return
        const lyric = everyLyrics.find((i) => i.uuid == activeSession?.lyricRef)
        if (!lyric) return

        let data = lyric.lines.map((i) => i['content'])
        data = data.map((item, i) => [i + 1, item]) as any
        data = data.filter((item) => !item[1].startsWith('['))
        data = data.filter((item) => !(item[1].trim() === ''))

        setActiveLyric(data as any)
    }, [everyLyrics, activeSession])

    return (
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-full h-full py-6 overflow-y-auto">
            <div className="flex gap-1">
                <LyricsView activeLyric={activeLyric} />
            </div>

            <div className="flex fixed bottom-0 w-screen h-44 bg-background-900">
                <div className="min-w-16 h-full bg-text-950"></div>
                <div className="flex flex-col w-full">
                    <div className="w-full h-6">tools</div>
                    <div className="w-full h-14 bg-background-700">full view</div>
                    <FocusEditorView timedlines={timedlines} />
                </div>
            </div>
        </div>
    )
}
