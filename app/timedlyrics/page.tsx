'use client'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { Fragment, useEffect, useRef, useState } from 'react'
import { formattedMS } from '../timedlines/page'
import NoSpaceStepIcon from '@/app/components/icons/NoSpaceSep'
import SpaceStepIcon from '@/app/components/icons/SpaceSep'

function FocusEditorViewTimelineDetails({
    start,
    end,
    width,
    detailTime,
    edetails
}: {
    start: number
    end: number
    width: number
    detailTime: number
    edetails: number
}) {
    const duration = end - start
    const rstart = start % detailTime // start remainder
    const dstart = start - rstart // start scaled for detailtimed
    const ostart = (rstart / duration) * width // start width

    const durationScaled = duration - (duration % detailTime) // properly scaled duration
    const remain = 1 - durationScaled / duration // remainder duration percentage
    const rwidth = width * remain // remainder width
    const dwidth = width - rwidth // width without remainder width
    const dgap = detailTime / durationScaled // detail gap
    const details = edetails * (durationScaled / detailTime) + 1
    const pxgap = width / details
    let sdetails = Math.floor(ostart / pxgap)
    sdetails += sdetails % 2

    return (
        <div className="relative flex w-full overflow-hidden">
            {Array.from({
                length: sdetails
            }).map((_, i) => (
                <Fragment key={i}>
                    {i % edetails !== 0 && i % 2 == 1 && (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-50"
                            style={{
                                left: (i / sdetails) * ostart + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-2 bg-text-600 opacity-50"></div>
                        </div>
                    )}

                    {i % edetails !== 0 && i % 2 != 1 && i % 2 == 0 && (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: (i / sdetails) * ostart + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-3 bg-text-700 z-50"></div>
                        </div>
                    )}
                </Fragment>
            ))}

            {Array.from({
                length: details
            }).map((_, i) => (
                <div key={i}>
                    {i % edetails === 0 && (
                        <div
                            className="z-30 flex justify-center absolute min-w-[2px] h-0 bg-text-400 opacity-55"
                            style={{
                                left: ostart + (i / edetails) * dgap * dwidth - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-2 bg-text-500 z-50 opacity-95"></div>
                            <div className="-top-0.5 absolute min-w-[2px] h-2  z-50 ">
                                <span className="text-xs text-text-400 select-none">
                                    {formattedMS(dstart + (i / edetails) * dgap * durationScaled)}
                                </span>
                            </div>
                            {/* <div className="absolute min-w-[1px] h-16 bg-text-100 opacity-55"></div> */}
                        </div>
                    )}

                    {i % edetails !== 0 && i % 2 == 1 && (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-50"
                            style={{
                                left: ostart + (i / edetails) * dgap * dwidth + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-2 bg-text-600 opacity-50"></div>
                        </div>
                    )}

                    {i % edetails !== 0 && i % 2 != 1 && i % 2 == 0 && (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: ostart + (i / edetails) * dgap * dwidth + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-3 bg-text-700 z-50"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

function TimedLyricEditor() {
    const [width, setWidth] = useState(0)
    const [focusWidth, setFocusWidth] = useState(0)
    const rootDiv = useRef<HTMLDivElement>(null)
    const [slices, setSlices] = useState<
        Array<{
            type: 'content' | 'nospace' | 'space'
            width?: number
            content?: string
        }>
    >([])

    const start = 26 * 1000 + 400
    const end = (26 + 8) * 1000 + 300
    const duration = end - start
    const lyric = 'What are these things I see?'
    const [timedlyrics, _] = useState([
        { offset: 4, type: 'space', time: 1 * 1000 },
        { offset: 8, type: 'nospace', time: 2 * 1000 },
        { offset: 14, type: 'space', time: 3 * 1000 },
        { offset: 22, type: 'space', time: 4 * 1000 },
        { offset: 24, type: 'nospace', time: 5 * 1000 }
    ])

    useEffect(() => {
        if (focusWidth == 0) return
        let oset = 0
        let pt = 0
        let slices = []
        const detailTime = 1000
        const rstart = start % detailTime
        const dstart = start - rstart
        let ostart = (rstart / duration) * focusWidth

        for (const timedlyric of timedlyrics) {
            slices.push({
                type: 'content',
                content: lyric.slice(oset, timedlyric.offset).trim(),
                width: ostart + ((timedlyric.time - pt) / duration) * focusWidth
            })
            slices.push({ type: timedlyric.type })
            oset = timedlyric.offset
            pt = timedlyric.time
            ostart = 0
        }

        ostart = (rstart / duration) * focusWidth

        slices.push({
            type: 'content',
            content: lyric.slice(oset).trim(),
            width: -ostart + ((duration - pt) / duration) * focusWidth
        })

        setSlices(slices as any)
    }, [focusWidth, duration, timedlyrics])

    useEffect(() => {
        if (!rootDiv.current) return
        const w = rootDiv.current.getBoundingClientRect().width
        setWidth(w)
        const detailTime = 1000
        const edetails = 20
        const durationScaled = duration - (duration % detailTime) // properly scaled duration
        const details = edetails * (durationScaled / detailTime) + 1

        const gapsize = 10

        setFocusWidth(w < gapsize * details ? gapsize * details : w)
    }, [rootDiv, width])

    return (
        <div
            ref={rootDiv}
            className="flex flex-col text-lg h-24 overflow-x-auto overflow-y-hidden w-full bg-background-800 bg-gradient-to-t from-background-900  to-95% to-background-950"
            style={{ width: width == 0 ? '' : width + 'px' }}
        >
            <div className="flex flex-col h-full" style={{ width: focusWidth + 'px' }}>
                <div className="flex h-6">
                    <FocusEditorViewTimelineDetails
                        start={start}
                        end={end}
                        width={focusWidth}
                        detailTime={1000}
                        edetails={20}
                    />
                </div>
                <div className="z-10 flex items-center h-16">
                    {slices.map((slice, idx) => (
                        <Fragment key={idx}>
                            {slice.type == 'content' && (
                                <div
                                    className="flex justify-center  rounded-sm"
                                    style={{
                                        minWidth: (slice.width ?? 0) - (idx / 2) * 1 ?? 'px'
                                    }}
                                >
                                    <span className="text-[1vw] text-text-300">
                                        {slice.content}
                                    </span>
                                </div>
                            )}

                            {slice.type == 'space' && (
                                <div className="h-24 max-w-[2px] -top-4 relative bg-background-900 flex justify-center">
                                    <div className="flex items-center h-24 min-w-5 cursor-ew-resize">
                                        <div className="flex items-end pb-1 fill-text-300 absolute h-12">
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
                                <div className="h-24 max-w-[2px] -top-4 relative bg-background-900 flex justify-center">
                                    <div className="flex items-center h-24 min-w-5 cursor-ew-resize">
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
    }, [everyLyrics, activeSession, dispatch])

    return (
        <>
            <div className="rounded bg-background-900">
                {activeLyric.map((item, idx) => (
                    <div
                        className="border-background-950 w-[44px] border-y-[1px] flex flex-col cursor-default"
                        key={idx}
                    >
                        <div className="flex items-center justify-center p-2 px-4 h-[44px] w-full">
                            <span className="text-text-300 select-none">{idx + 1}</span>
                        </div>
                        <div
                            style={{ display: idx == 2 ? 'flex' : 'none' }}
                            className="h-24 z-30  w-full bg-background-base border-background-950 border-t-[2px]"
                        ></div>
                    </div>
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, idx) => (
                    <div
                        key={lyric[0]}
                        className="border-background-950 min-w-[700px] border-y-[1px] flex flex-col w-full cursor-pointer "
                    >
                        <div className="p-2 px-4">
                            <span className="text-xl text-text-300 select-none">{lyric[1]}</span>
                        </div>

                        {idx !== 2 || <TimedLyricEditor />}
                    </div>
                ))}
            </div>
        </>
    )
}

export default function Page() {
    return (
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-screen h-full py-6 overflow-y-auto overflow-x-hidden">
            <div className="flex gap-1">
                <LyricsView />
            </div>
        </div>
    )
}
