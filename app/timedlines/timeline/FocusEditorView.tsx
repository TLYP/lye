import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { formattedMS } from '../page'
import { DragToTimelineDrophandleComponent } from './DragToTimelineComponent'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as AudioPlayerActions from '@/lib/audioplayer'

function FocusEditorViewTimelineDetails({
    duration,
    divwidth,
    detailTime
}: {
    duration: number
    divwidth: number
    detailTime: number
}) {
    const details = Math.floor(duration / detailTime)

    return (
        <div className="relative flex w-full">
            {Array.from({
                length: details
            }).map((_, i) => (
                <div key={i}>
                    {i % 5 == 0 ? (
                        <div
                            className="flex justify-center absolute min-w-[2px] h-0 bg-text-400 opacity-55"
                            style={{
                                left: i * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-1 bg-text-400 z-50 opacity-95"></div>
                            <div className="-top-0.5 absolute min-w-[2px] h-2  z-50 ">
                                <span className="text-xs text-text-400 select-none">
                                    {formattedMS(i * detailTime)}
                                </span>
                            </div>
                            <div className="absolute min-w-[1px] h-24 bg-text-800 opacity-55"></div>
                        </div>
                    ) : (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: i * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-2 bg-text-800 z-50"></div>
                            <div className="absolute min-w-[2px] h-24 bg-text-700 opacity-20"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default function FocusEditorView({
    setTimedlines,
    timedlines,
    zoomSize,
    detailTime
}: {
    timedlines: Array<{ start: number; end: number; uhash: number }>
    zoomSize: number
    detailTime: number
    setTimedlines: Dispatch<SetStateAction<Array<any>>>
}) {
    const state = useRef<HTMLDivElement>()
    const rootDiv = useRef<HTMLDivElement>()
    const duration = useAppSelector((state) =>
        Math.floor((state.audioPlayer.audio?.duration ?? 0) * 1000)
    )
    const [width, setWidth] = useState(0)
    const [defaultWidth, setDefaultWidth] = useState(0)
    const [activityTarget, setActivityTarget] = useState<number | null>(null)
    const [activityInitialOffset, setActivityInitialOffset] = useState<number>(0)
    const [mouseActivity, setMouseActivity] = useState<
        'inactive' | 'moving' | 'resizeleft' | 'resizeright'
    >('inactive')

    useEffect(() => {
        if (!state.current) return
        const pxBetweenDetails = 50
        const w = Math.floor(duration / 1000) * (pxBetweenDetails * zoomSize)

        setWidth(w)
    }, [duration, state, defaultWidth, zoomSize])

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
            className="flex overflow-y-hidden overflow-x-scroll flex-col grow bg-background-800 bg-gradient-to-b from-background-950 to-45% to-background-900"
        >
            <div className="flex flex-col grow relative" style={{ width: width + 'px' }}>
                <div className="left-[900px] top-0 w-[2px] h-full bg-text-800 opacity-85 absolute z-50"></div>
                <div className="flex justify-between h-4 w-full" ref={state as any}>
                    <FocusEditorViewTimelineDetails
                        detailTime={detailTime}
                        duration={duration}
                        divwidth={width}
                    />
                </div>
                <div className="h-7 flex relative grow w-full py-1">
                    {/* drag component acceptor */}
                    <DragToTimelineDrophandleComponent />

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
