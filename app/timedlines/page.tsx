'use client'
import TimelineComponent from './timeline/Component'
import DragToTimelineComponent from './timeline/DragToTimelineComponent'
import * as TimedlinesActions from '@/lib/timedlines'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useState, useEffect } from 'react'
import { cyrb53 } from '@/app/cachedb/index'
import { Session, SessionReference } from '../cachedb/sessions'
import { TimedLinesReferenceLine } from '../cachedb/timedlines'

export function formattedMS(milliseconds?: number) {
    if (milliseconds == undefined) return '--:--.---'

    let ms = Math.round(milliseconds) % 1000
    let seconds = Math.floor((milliseconds / 1000) % 60)
    let minutes = Math.floor(milliseconds / 1000 / 60)

    // let fms = ms < 10 ? '.00' + ms : ms < 100 ? '.0' + ms : '.' + ms
    // if (ms == 0) fms = ''

    let fms = ms < 10 ? '.00' + ms : ms < 100 ? '.0' + ms : '.' + ms

    return `${minutes < 10 ? '0' + minutes : minutes}:${
        seconds < 10 ? '0' + seconds : seconds
    }${fms}`
}

function LyricsView({ activeLyric }: { activeLyric: Array<[number, string]> }) {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const [session, setSession] = useState<null | SessionReference>(null)
    const timedlines = useAppSelector((state) => state.timedlines)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (activeSession == null) return
        ;(async () => {
            setSession(await Session.get(activeSession.uuid))
        })()
    }, [activeSession])

    useEffect(() => {
        if (!session) return
        session.timedlines.primary.lines = timedlines.primary.map(
            (data) => new TimedLinesReferenceLine(data)
        )

        session.timedlines.secondary.lines = timedlines.secondary.map(
            (data) => new TimedLinesReferenceLine(data)
        )

        session.timedlines.update()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timedlines])

    useEffect(() => {
        const uhashMap = new Map(
            activeLyric.map((item, idx) => [cyrb53(`${item[0]}-${item[1]}`), idx + 1])
        )

        ;(['primary', 'secondary'] as Array<TimedlinesActions.TimelineTarget>).forEach((target) =>
            timedlines[target]
                .filter(
                    (item) =>
                        uhashMap.get(item.uhash) !== undefined &&
                        uhashMap.get(item.uhash) !== item.displayLineNumber
                )
                .map((item) => ({
                    ...item,
                    displayLineNumber: uhashMap.get(item.uhash) ?? item.linenumber
                }))
                .forEach((item) =>
                    dispatch(
                        TimedlinesActions.update([target, { uhash: item.uhash, content: item }])
                    )
                )
        )
    }, [timedlines, activeLyric, dispatch])

    const lineInTimeline = (uhash: number) =>
        timedlines.primary.findIndex((item) => item.uhash == uhash) !== -1 ||
        timedlines.secondary.findIndex((item) => item.uhash == uhash) !== -1

    const getTimedline = (uhash: number) =>
        timedlines.primary.find((item) => item.uhash == uhash) ||
        timedlines.secondary.find((item) => item.uhash == uhash)

    return (
        <>
            <div className="rounded bg-background-900">
                {activeLyric.map((item, idx) => (
                    <div
                        className="border-background-950 w-[44px] border-y-[1px] flex cursor-default"
                        style={{
                            opacity: lineInTimeline(cyrb53(`${item[0]}-${item[1]}`)) ? '1' : '1'
                        }}
                        key={idx}
                    >
                        <div className="flex items-center justify-center p-2 px-4 h-[44px] w-full">
                            <span className="text-text-300 select-none">{idx + 1}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((i, idx) => (
                    <div
                        className="border-background-950 border-y-[1px] flex w-28 cursor-default"
                        key={idx}
                        data-uhash={cyrb53(`${i[0]}-${i[1]}`)}
                    >
                        <div className="text-center p-2 px-4 w-full h-[44px] ">
                            <span className="text-text-300 select-none">
                                {formattedMS(getTimedline(cyrb53(`${i[0]}-${i[1]}`))?.start)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded bg-background-900">
                {activeLyric.map((item, idx) => (
                    <DragToTimelineComponent
                        uhash={cyrb53(`${item[0]}-${item[1]}`)}
                        content={item[1]}
                        linenumber={item[0]}
                        dragcontent={`${idx + 1}`}
                        key={idx}
                    />
                ))}
            </div>
            <div className="rounded bg-background-900">
                {activeLyric.map((i, idx) => (
                    <div
                        className="border-background-950 border-y-[1px] flex w-28 cursor-default"
                        key={idx}
                    >
                        <div className="text-center p-2 w-full h-[44px] px-4">
                            <span className="text-text-300 select-none">
                                {formattedMS(getTimedline(cyrb53(`${i[0]}-${i[1]}`))?.end)}
                            </span>
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
                            <span className="text-text-300 select-none">{i[0]}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default function Page() {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
    const dispatch = useAppDispatch()
    const [activeLyric, setActiveLyric] = useState<Array<[number, string]>>([])
    const [detailTime, setDetailTime] = useState(1000) // milliseconds
    const [zoomSize, setZoomSize] = useState(1)

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
    }, [everyLyrics, activeSession, dispatch])

    useEffect(() => {
        if (zoomSize <= 0.75) setDetailTime(2000)
        else if (zoomSize <= 1.5) setDetailTime(1000)
        else if (zoomSize < 2) setDetailTime(500)
        else if (zoomSize < 2.5) setDetailTime(250)
    }, [zoomSize])

    return (
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-screen h-full py-6 overflow-y-auto overflow-x-hidden">
            <div className="flex gap-1">
                <LyricsView activeLyric={activeLyric} />
            </div>

            <TimelineComponent
                detailTime={detailTime}
                zoomSize={zoomSize}
                setZoomSize={setZoomSize}
            />
        </div>
    )
}
