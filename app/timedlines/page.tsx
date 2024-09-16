'use client'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react'
import * as Lyrics from '@/lib/lyrics'
import { TimedLines } from '../cachedb/timedlines'
import { Slider } from '@mantine/core'

function formattedMS(milliseconds: number) {
    let ms = Math.round(milliseconds) % 1000
    let seconds = Math.floor((milliseconds / 1000) % 60)
    let minutes = Math.floor(milliseconds / 1000 / 60)

    let fms = ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms

    return `${minutes < 10 ? '0' + minutes : minutes}:${
        seconds < 10 ? '0' + seconds : seconds
    }.${fms}`
}

function ToolsView({ setZoomSize }: { setZoomSize: Dispatch<SetStateAction<number>> }) {
    return (
        <div className="flex justifycenter w-full h-6">
            <div className="flex w-96 h-6 grow-[1]">
                <div className="flex items-center">
                    <div className="w-44">
                        <Slider
                            onChange={setZoomSize}
                            defaultValue={2}
                            min={1.5}
                            step={0.01}
                            max={5}
                            size="xs"
                            label={null}
                            color="grey"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-center w-72 h-6 grow-[1]"></div>
        </div>
    )
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
                            <span className="text-text-300 select-none">{idx + 1}</span>
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
                            <span className="text-text-300 select-none">--:--.---</span>
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
                            <span className="text-xl text-text-300 select-none">{item[1]}</span>
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
                            <span className="text-text-300 select-none">--:--.---</span>
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

function FocusEditorViewTimelineDetails({
    duration,
    divwidth,
    detailSize
}: {
    duration: number
    divwidth: number
    detailSize: number
}) {
    const details = Math.floor(duration / (1000 * detailSize))

    return (
        <div className="relative flex w-full">
            {Array.from({
                length: details
            }).map((_, i) => (
                <>
                    {i % 5 == 0 ? (
                        <div
                            key={i}
                            className="flex justify-center absolute min-w-[1px] h-0 bg-text-400 opacity-55"
                            style={{
                                left: i * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[1px] h-1 bg-text-400 z-50 opacity-95"></div>
                            <div className="-top-0.5 absolute min-w-[1px] h-2  z-50 ">
                                <span className="text-xs text-text-400 select-none">
                                    {formattedMS((i / details) * duration)}
                                </span>
                            </div>
                            <div className="absolute min-w-[1px] h-24 bg-text-800 opacity-55"></div>
                        </div>
                    ) : (
                        <div
                            key={i}
                            className="absolute flex min-w-[1px] h-0 opacity-40"
                            style={{
                                left: i * (divwidth / details) - 0.5 + 'px'
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
    setTimedlines,
    timedlines,
    detailSize,
    zoomSize
}: {
    timedlines: Array<{ start: number; end: number; uhash: number }>
    detailSize: number
    zoomSize: number
    setTimedlines: Dispatch<SetStateAction<Array<any>>>
}) {
    const state = useRef<HTMLDivElement>()
    const rootDiv = useRef<HTMLDivElement>()
    const [width, setWidth] = useState(0)
    const [defaultWidth, setDefaultWidth] = useState(0)
    const [duration, _] = useState(60 * 1000)
    const [activityTarget, setActivityTarget] = useState<number | null>(null)
    const [activityInitialOffset, setActivityInitialOffset] = useState<number>(0)
    const [mouseActivity, setMouseActivity] = useState<
        'inactive' | 'moving' | 'resizeleft' | 'resizeright'
    >('inactive')

    useEffect(() => {
        if (!state.current) return
        setWidth(state.current.getBoundingClientRect().width)
    }, [state, defaultWidth, zoomSize])

    useEffect(() => {
        if (!rootDiv.current) return
        setDefaultWidth(rootDiv.current.getBoundingClientRect().width)
    }, [rootDiv])

    const movingTarget = (x: number) => {
        if (activityTarget == null) return
        document.body.style.setProperty('cursor', 'move', 'important')

        setTimedlines(
            timedlines.map((item, i) => {
                if (i != activityTarget) return item

                const f = (x: number) => duration * (x / width) // px to ms
                const g = (x: number) => width * (x / duration) // ms to px

                const d = item.end - item.start
                item.start = f(x)
                item.end = f(g(d) + x)

                if (item.end >= duration) {
                    item.end = duration
                    item.start = item.end - d
                }

                if (timedlines[i - 1] != undefined && item.start <= timedlines[i - 1].end) {
                    item.start = timedlines[i - 1].end
                    item.end = item.start + d
                }

                if (timedlines[i + 1] != undefined && item.end >= timedlines[i + 1].start) {
                    item.end = timedlines[i + 1].start
                    item.start = item.end - d
                }

                return item
            })
        )
    }

    const resizeLeft = (x: number) => {
        if (activityTarget == null) return
        document.body.style.setProperty('cursor', 'w-resize', 'important')

        setTimedlines(
            timedlines.map((item, i) => {
                if (i != activityTarget) return item

                const f = (x: number) => duration * (x / width) // px to ms

                item.start = f(x)

                if (item.end - item.start <= 1000) {
                    item.start = item.end - 1000
                }

                if (timedlines[i - 1] != undefined && item.start <= timedlines[i - 1].end) {
                    item.start = timedlines[i - 1].end
                }

                return item
            })
        )
    }

    const resizeRight = (x: number) => {
        if (activityTarget == null) return
        document.body.style.setProperty('cursor', 'e-resize', 'important')

        setTimedlines(
            timedlines.map((item, i) => {
                if (i != activityTarget) return item

                const f = (x: number) => duration * (x / width) // px to ms

                item.end = f(x)

                if (item.end >= duration) {
                    item.end = duration
                }

                if (item.end - item.start <= 1000) {
                    item.end = item.start + 1000
                }

                if (timedlines[i + 1] != undefined && item.end >= timedlines[i + 1].start) {
                    item.end = timedlines[i + 1].start
                }

                return item
            })
        )
    }

    const handleMouseActivity = (e: MouseEvent) => {
        if (mouseActivity == 'inactive' || rootDiv.current == undefined) return
        const Xoffset = 64

        const f = (x: number) => duration * (x / width) // px to ms
        let x = e.clientX - Xoffset - activityInitialOffset + rootDiv.current.scrollLeft
        if (x < 0) x = 0

        if (mouseActivity == 'moving') movingTarget(x)
        else if (mouseActivity == 'resizeleft') resizeLeft(x)
        else if (mouseActivity == 'resizeright') resizeRight(x)
    }

    useEffect(() => {
        const mousemoveListener = (e: MouseEvent) => handleMouseActivity(e)

        const mouseupListener = () => {
            setMouseActivity('inactive')
            setActivityInitialOffset(0)
            document.body.style.removeProperty('cursor')
        }

        document.addEventListener('mousemove', mousemoveListener)
        document.addEventListener('mouseup', mouseupListener)

        return () => {
            document.removeEventListener('mousemove', mousemoveListener)
            document.removeEventListener('mouseup', mouseupListener)
        }
    })

    const findActivityOffset = (target: number, ix: number) => {
        const Xoffset = 64
        const x = ix - Xoffset
        const item = document.getElementById(`detail-item-` + target)
        if (item == undefined) return

        const left = item.getBoundingClientRect().left - Xoffset

        setActivityInitialOffset(x - left)
    }

    return (
        <div
            ref={rootDiv as any}
            className="flex overflow-x-scroll flex-col grow bg-background-800 bg-gradient-to-b from-background-950 to-45% to-background-900"
        >
            <div
                className="flex flex-col grow relative"
                style={{ width: 64 + zoomSize * defaultWidth + 'px' }}
            >
                <div className="left-[900px] top-0 w-[2px] h-full bg-text-800 opacity-85 absolute z-50"></div>
                <div className="flex justify-between h-4 w-full" ref={state as any}>
                    <FocusEditorViewTimelineDetails
                        duration={duration}
                        divwidth={width}
                        detailSize={detailSize}
                    />
                </div>
                <div className="h-7 flex relative grow w-full py-1">
                    {timedlines.map((item, i) => (
                        <div
                            key={i}
                            id={`detail-item-${i}`}
                            className="border-text-800 border-[1px] absolute rounded flex justify-center items-center bg-background-800 h-8"
                            style={{
                                width: ((item.end - item.start) / duration) * width + 'px',
                                left: (item.start / duration) * width + 'px'
                            }}
                        >
                            <div
                                style={{
                                    cursor:
                                        mouseActivity == 'inactive' || activityTarget == i
                                            ? 'w-resize'
                                            : ''
                                }}
                                onMouseDown={(e) => {
                                    setActivityTarget(i)
                                    setMouseActivity('resizeleft')
                                }}
                                className="left-0 absolute w-2 h-full"
                            ></div>
                            <div
                                style={{
                                    cursor:
                                        mouseActivity == 'inactive' || activityTarget == i
                                            ? 'move'
                                            : ''
                                }}
                                onMouseDown={(e) => {
                                    setActivityTarget(i)
                                    setMouseActivity('moving')
                                    findActivityOffset(i, e.clientX)
                                }}
                                className="flex justify-center grow-[1]"
                            >
                                <span className="text-text-400 select-none">--:--</span>
                            </div>
                            <div
                                style={{
                                    cursor:
                                        mouseActivity == 'inactive' || activityTarget == i
                                            ? 'e-resize'
                                            : ''
                                }}
                                onMouseDown={(e) => {
                                    setActivityTarget(i)
                                    setMouseActivity('resizeright')
                                }}
                                className="right-0 absolute w-2 h-full"
                            ></div>
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
    const [detailSize, setDetailSize] = useState(1)
    const [zoomSize, setZoomSize] = useState(1.5)
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
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-screen h-full py-6 overflow-y-auto overflow-x-hidden">
            <div className="flex gap-1">
                <LyricsView activeLyric={activeLyric} />
            </div>

            <div className="flex fixed bottom-0 w-screen h-44 overflow-hidden bg-background-900">
                <div className="min-w-16 h-full bg-text-950"></div>
                <div className="flex flex-col w-full">
                    <ToolsView setZoomSize={setZoomSize} />
                    <div className="grow-[1] h-14 bg-background-900">full view</div>
                    <FocusEditorView
                        setTimedlines={setTimedlines}
                        timedlines={timedlines}
                        detailSize={detailSize}
                        zoomSize={zoomSize}
                    />
                </div>
            </div>
        </div>
    )
}
