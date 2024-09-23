'use client'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import * as TimedlinesActions from '@/lib/timedlines'
import { TimedLyricLineData } from '../cachedb/timedlyrics'
import { Session } from '../cachedb/sessions'
import TimedLyricEditor from './editor/Component'

function LyricsView() {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
    const timedlines = useAppSelector((state) => state.timedlines)
    const activeLine = useAppSelector((state) => state.timedlyrics.activeLine)
    const dispatch = useAppDispatch()

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
        ;(async () => {
            if (activeSession === null) return

            const session = await Session.get(activeSession.uuid)
            const timedlines = session.timedlines.serialize().timelines

            dispatch(TimedlinesActions.loadAll(timedlines))
        })()
    }, [everyLyrics, activeSession])

    const inTimedlines = (linenumber: number) => {
        return (
            [...timedlines.primary, ...timedlines.secondary].findIndex(
                (item) => item.linenumber == linenumber
            ) !== -1
        )
    }

    return (
        <>
            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, idx) => (
                    <div
                        className="border-background-950 w-[44px] border-y-[1px] flex flex-col"
                        key={idx}
                    >
                        <div className="flex items-center justify-center p-2 px-4 h-[44px] w-full">
                            <span
                                className="select-none"
                                style={{
                                    color: inTimedlines(lyric[0])
                                        ? activeLine == lyric[0]
                                            ? 'var(--text-100)'
                                            : 'var(--text-300)'
                                        : 'var(--text-800)'
                                }}
                            >
                                {idx + 1}
                            </span>
                        </div>
                        <div
                            style={{ display: lyric[0] === activeLine ? 'flex' : 'none' }}
                            className="h-24 z-30  w-full bg-background-base border-background-950 border-t-[2px]"
                        ></div>
                    </div>
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, _) => (
                    <div
                        key={lyric[0]}
                        onClick={() => dispatch(TimedLyricsAction.setActive(lyric[0]))}
                        className="border-background-950 min-w-[700px] border-y-[1px] flex flex-col w-full"
                    >
                        <div className="p-2 px-4">
                            <span
                                style={{
                                    cursor: inTimedlines(lyric[0])
                                        ? activeLine == lyric[0]
                                            ? 'default'
                                            : 'pointer'
                                        : 'default',
                                    color: inTimedlines(lyric[0])
                                        ? activeLine == lyric[0]
                                            ? 'var(--text-200)'
                                            : 'var(--text-300)'
                                        : 'var(--text-800)'
                                }}
                                className="text-xl select-none"
                            >
                                {lyric[1]}
                            </span>
                        </div>

                        {lyric[0] === activeLine && <TimedLyricEditor activeLyrics={activeLyric} />}
                    </div>
                ))}
            </div>
        </>
    )
}

export default function Page() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(TimedLyricsAction.setActive(4))
        const data: Record<string, TimedLyricLineData> = {
            4: [
                { offset: 4, type: 'space', time: 1 * 1000 },
                { offset: 8, type: 'nospace', time: 2 * 1000 },
                { offset: 14, type: 'space', time: 3 * 1000 },
                { offset: 22, type: 'space', time: 4 * 1000 },
                { offset: 24, type: 'nospace', time: 5 * 1000 }
            ]
        }
        dispatch(TimedLyricsAction.loadAll(data))
    }, [])

    return (
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-screen h-full py-6 overflow-y-auto overflow-x-hidden">
            <div className="flex gap-1">
                <LyricsView />
            </div>
        </div>
    )
}
