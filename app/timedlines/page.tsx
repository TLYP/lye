'use client'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useState, useEffect } from 'react'
import * as Lyrics from '@/lib/lyrics'
import { TimedLines } from '../cachedb/timedlines'

export default function Page() {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
    const [activeLyric, setActiveLyric] = useState<Array<[number, string]>>([])

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

    useEffect(() => {
        const c = async () => {
            if (activeSession == null) return
            const timedlines = await TimedLines.get(activeSession.timedlinesRef)
        }

        c()
    }, [activeSession])

    return (
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-full h-full py-6 overflow-y-scroll">
            <div className="flex gap-1">
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
            </div>

            <div className="fixed bottom-0 w-screen h-44 bg-background-900"></div>
        </div>
    )
}
