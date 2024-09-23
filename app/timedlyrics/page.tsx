'use client'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { Fragment, useEffect, useRef, useState } from 'react'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import * as TimedlinesActions from '@/lib/timedlines'
import NoSpaceStepIcon from '@/app/components/icons/NoSpaceSep'
import SpaceStepIcon from '@/app/components/icons/SpaceSep'
import { TimedLyricLineData, TimedLyricLineItemData } from '../cachedb/timedlyrics'
import { Session } from '../cachedb/sessions'
import FocusEditorViewTimelineDetails from './TimelineDetailsComponent'

function TimedLyricEditor({ activeLyrics }: { activeLyrics: Array<[number, string]> }) {
    const dispatch = useAppDispatch()
    const activeLine = useAppSelector((state) => state.timedlyrics.activeLine)
    const timedlines = useAppSelector((state) => state.timedlines)
    const lines = useAppSelector((state) => state.timedlyrics.lines)
    const [width, setWidth] = useState(0)
    const [focusWidth, setFocusWidth] = useState(0)
    const rootDiv = useRef<HTMLDivElement>(null)
    const [target, setTarget] = useState<null | number>(null)
    const [targetAction, setTargetAction] = useState<null | 'moving'>(null)
    const [slices, setSlices] = useState<
        Array<{
            type: 'content' | 'nospace' | 'space'
            width?: number
            content?: string
            targetIndex?: number
        }>
    >([])
    const [line, setLine] = useState<TimedLyricLineData>([])

    const [start, setStart] = useState(24 * 1000)
    const [end, setEnd] = useState(34 * 1000)
    const [duration, setDuration] = useState(end - start)

    const detailTime = 1000
    const extradetails = 16

    useEffect(() => {
        const item = [...timedlines.primary, ...timedlines.secondary].find(
            (item) => item.linenumber == activeLine
        )
        if (!item) return

        setStart(item.start)
        setEnd(item.end)
        setDuration(item.end - item.start)
    }, [timedlines, activeLine])

    useEffect(() => {
        if (!activeLine) return

        const lineitem = lines[activeLine]
        setLine(lineitem ?? [])
    }, [lines, activeLine])

    useEffect(() => {
        if (focusWidth == 0) return
        let oset = 0
        let pt = 0
        let nslices = []

        const lyric = activeLyrics.find((item) => item[0] == activeLine)?.[1]
        if (!lyric) return

        for (let i = 0; i < line.length; i++) {
            const timedlyric = line[i]
            nslices.push({
                type: 'content',
                content: lyric.slice(oset, timedlyric.offset).trim(),
                width: ((timedlyric.time - pt) / duration) * focusWidth
            })
            nslices.push({ type: timedlyric.type, targetIndex: i })

            oset = timedlyric.offset
            pt = timedlyric.time
        }

        nslices.push({
            type: 'content',
            content: lyric.slice(oset).trim(),
            width: ((duration - pt) / duration) * focusWidth
        })

        setSlices(() => {
            return [...nslices] as any
        })
    }, [duration, focusWidth, line])

    useEffect(() => {
        if (!rootDiv.current) return
        const w = rootDiv.current.getBoundingClientRect().width
        setWidth(w)
        const durationScaled = duration - (duration % detailTime) // properly scaled duration
        const details = extradetails * Math.floor(durationScaled / detailTime) + 1

        const gapsize = 5

        setFocusWidth(w < gapsize * details ? gapsize * details : w)
        // setFocusWidth(w * 1)
    }, [rootDiv, width, duration])

    const activateTarget = (index: number) => {
        setTarget(index)
        setTargetAction('moving')
    }

    useEffect(() => {
        const handleMove = (x: number) => {
            if (target == null) return

            document.body.style.setProperty('cursor', 'ew-resize', 'important')
            let item = { ...line[target] }
            const xr = x / width
            let time = xr * duration

            const left = line[target - 1]
            const right = line[target + 1]

            if (left && left.time + 100 >= time) time = left.time + 100
            if (right && right.time - 100 <= time) time = right.time - 100

            item['time'] = time
            dispatch(TimedLyricsAction.update({ index: target, content: item }))
        }

        const mousemoveHandler = (e: MouseEvent) => {
            if (targetAction == null) return
            let left = rootDiv.current?.getBoundingClientRect().left ?? 0
            const x = e.clientX
            let ox = x - left < 0 ? 0 : x - left
            handleMove(ox)
        }

        const mouseupHandler = (e: MouseEvent) => {
            document.body.style.removeProperty('cursor')
            setTarget(null)
            setTargetAction(null)
        }

        document.addEventListener('mousemove', mousemoveHandler)
        document.addEventListener('mouseup', mouseupHandler)

        return () => {
            document.removeEventListener('mousemove', mousemoveHandler)
            document.removeEventListener('mouseup', mouseupHandler)
        }
    })

    return (
        <div
            ref={rootDiv}
            className="flex flex-col text-lg h-24 overflow-x-auto overflow-y-hidden w-full bg-background-800 bg-gradient-to-t from-background-900  to-95% to-background-950"
            style={{ width: width == 0 ? '' : width + 'px' }}
        >
            <div
                className="flex flex-col h-full overflow-hidden"
                style={{ width: focusWidth + 'px' }}
            >
                <div className="flex h-6">
                    <FocusEditorViewTimelineDetails
                        start={start}
                        end={end}
                        width={focusWidth}
                        detailTime={detailTime}
                        edetails={extradetails}
                    />
                </div>
                <div className="z-10 flex items-center h-16">
                    {slices.map((slice, idx) => (
                        <Fragment key={idx}>
                            {slice.type == 'content' && (
                                <div
                                    className="flex justify-center  rounded-sm"
                                    style={{
                                        maxWidth: (slice.width ?? 0) - (idx / 2) * 1 ?? 'px',
                                        minWidth: (slice.width ?? 0) - (idx / 2) * 1 ?? 'px'
                                    }}
                                >
                                    <span className="text-base text-text-300 select-none">
                                        {slice.content}
                                    </span>
                                </div>
                            )}

                            {slice.type == 'space' && (
                                <div className="h-24 max-w-[2px] -top-4 opacity-35 relative bg-background-900 flex justify-center">
                                    <div
                                        onMouseDown={() => activateTarget(slice.targetIndex ?? 0)}
                                        className="flex items-center h-24 min-w-5 cursor-ew-resize"
                                    >
                                        <div className="cursor-ew-resize flex items-end pb-1 fill-text-300 absolute h-12">
                                            <SpaceStepIcon
                                                width={20}
                                                height={12}
                                                className="stroke-text-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {slice.type == 'nospace' && (
                                <div className="h-24 max-w-[2px] -top-4 opacity-35 relative bg-background-900 flex justify-center">
                                    <div
                                        onMouseDown={() => activateTarget(slice.targetIndex ?? 0)}
                                        className="flex items-center h-24 min-w-5 cursor-ew-resize"
                                    >
                                        <div className="flex -left-[8px] items-end pb-1 fill-text-300 absolute h-12">
                                            <NoSpaceStepIcon
                                                width={24}
                                                height={14}
                                                className="stroke-text-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

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
