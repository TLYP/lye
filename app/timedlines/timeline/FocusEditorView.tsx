import { useEffect, useRef, useState } from 'react'
import { formattedMS } from '../page'
import { DragToTimelineDrophandleComponent } from './DragToTimelineComponent'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as TimedlinesActions from '@/lib/timedlines'
import { Session, SessionReference } from '@/app/cachedb/sessions'
import { TimedLinesReferenceLine } from '@/app/cachedb/timedlines'

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
                    {i % 16 == 0 ? (
                        <div
                            className="flex justify-center absolute min-w-[2px] h-0 bg-text-400 opacity-55"
                            style={{
                                left: (1 + i) * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-1 bg-text-400 z-50 opacity-95"></div>
                            <div className="-top-0.5 absolute min-w-[2px] h-2  z-50 ">
                                <span className="text-xs text-text-400 select-none">
                                    {formattedMS((1 + i) * detailTime)}
                                </span>
                            </div>
                            <div className="absolute min-w-[1px] h-28 bg-text-800 opacity-55"></div>
                        </div>
                    ) : i % 2 !== 0 ? (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: (1 + i) * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-2 bg-text-700 opacity-20"></div>
                        </div>
                    ) : (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: (1 + i) * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-3 bg-text-800 z-50"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default function FocusEditorView({
    zoomSize,
    detailTime
}: {
    zoomSize: number
    detailTime: number
}) {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const [session, setSession] = useState<null | SessionReference>(null)
    const dispatch = useAppDispatch()
    const state = useRef<HTMLDivElement>()
    const rootDiv = useRef<HTMLDivElement>()
    const duration = useAppSelector((state) =>
        Math.floor((state.audioPlayer.audio?.duration ?? 0) * 1000)
    )
    const currentTime = useAppSelector((state) =>
        Math.floor((state.audioPlayer.audio?.currentTime ?? 0) * 1000)
    )

    const timedlines = useAppSelector((state) => state.timedlines)
    const [width, setWidth] = useState(0)
    const [defaultWidth, setDefaultWidth] = useState(0)
    const [activityTarget, setActivityTarget] = useState<number | null>(null)
    const [activityInitialOffset, setActivityInitialOffset] = useState<number>(0)
    const [mouseActivity, setMouseActivity] = useState<
        'inactive' | 'moving' | 'resizeleft' | 'resizeright'
    >('inactive')
    const [scrollLeft, setScrollLeft] = useState(0)

    /** px to ms */
    const f = (x: number) => duration * (x / width)
    /** ms to px */
    const g = (x: number) => width * (x / duration)

    const getTimedline = (uhash: number) => {
        const pm = timedlines['primary'].findIndex((item) => item.uhash == uhash)
        const sc = timedlines['secondary'].findIndex((item) => item.uhash == uhash)

        if (sc == -1 && pm == -1) return null

        const target: TimedlinesActions.TimelineTarget = pm !== -1 ? 'primary' : 'secondary'
        const index = pm !== -1 ? pm : sc
        const content = pm !== -1 ? timedlines['primary'][pm] : timedlines['secondary'][sc]

        return {
            target,
            index,
            content
        }
    }

    useEffect(() => {
        if (activeSession == null) return
        ;(async () => {
            setSession(await Session.get(activeSession.uuid))
        })()
    }, [activeSession])

    useEffect(() => {
        const handleResize = () => {
            if (!rootDiv.current) return
            setWidth(rootDiv.current.getBoundingClientRect().width)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

    useEffect(() => {
        if (!state.current) return
        const pxBetweenDetails = 15
        const w = Math.floor(duration / 1000) * (pxBetweenDetails * zoomSize)

        setWidth(w)
    }, [duration, state, defaultWidth, zoomSize])

    useEffect(() => {
        if (!rootDiv.current) return
        setDefaultWidth(rootDiv.current.getBoundingClientRect().width)

        const handleScroll = () => setScrollLeft(rootDiv.current!.scrollLeft)
        let element = rootDiv.current
        element.addEventListener('scroll', handleScroll)

        return () => {
            element.removeEventListener('scroll', handleScroll)
        }
    }, [rootDiv])

    const findNearestRight = (linenumber: number, target: TimedlinesActions.TimelineTarget) =>
        timedlines[target]
            .filter((item) => item.linenumber > linenumber)
            .map((item) => ({
                val: Math.abs(item.linenumber - linenumber),
                item
            }))
            .sort((i1, i2) => i2.val - i1.val)
            .pop()?.item

    const findNearestLeft = (linenumber: number, target: TimedlinesActions.TimelineTarget) =>
        timedlines[target]
            .filter((item) => item.linenumber < linenumber)
            .map((item) => ({
                val: Math.abs(item.linenumber - linenumber),
                item
            }))
            .sort((i1, i2) => i2.val - i1.val)
            .pop()?.item

    const adjustStartAndEnd = (
        item: TimedlinesActions.TimelineItemState,
        width: number,
        target: TimedlinesActions.TimelineTarget
    ) => {
        const leftItem = findNearestLeft(item.linenumber, target)
        const rightItem = findNearestRight(item.linenumber, target)

        if (leftItem && item.start <= leftItem.end) {
            item.start = leftItem.end
            item.end = item.start + width
        }

        if (rightItem != undefined && item.end >= rightItem.start) {
            item.end = rightItem.start
            item.start = item.end - width
        }

        return item
    }

    const movingTarget = async (x: number, y: number) => {
        if (activityTarget == null) return
        document.body.style.setProperty('cursor', 'move', 'important')

        const result = getTimedline(activityTarget)
        if (result == undefined) return

        let item = { ...result.content }
        const { target } = result

        const d = item.end - item.start
        item.start = f(x)
        item.end = f(g(d) + x)
        if (item.end >= duration) {
            item.end = duration
            item.start = item.end - d
        }

        item = adjustStartAndEnd(item, d, target)

        const bodyHeight = document.body.getBoundingClientRect().height

        if (y >= bodyHeight - 34 && target !== 'secondary') {
            dispatch(TimedlinesActions.remove(['primary', { uhash: item.uhash }]))

            item.start = f(x)
            item.end = f(g(d) + x)
            item = adjustStartAndEnd(item, d, 'secondary')
            dispatch(TimedlinesActions.add(['secondary', item]))
            return
        } else if (y <= bodyHeight - 34 && target !== 'primary') {
            dispatch(TimedlinesActions.remove(['secondary', { uhash: item.uhash }]))

            item.start = f(x)
            item.end = f(g(d) + x)
            item = adjustStartAndEnd(item, d, 'primary')
            dispatch(TimedlinesActions.add(['primary', item]))
            return
        }

        dispatch(
            TimedlinesActions.update([
                target,
                {
                    uhash: item.uhash,
                    content: { ...item }
                }
            ])
        )
    }

    const resizeLeft = (x: number) => {
        if (activityTarget == null) return
        document.body.style.setProperty('cursor', 'w-resize', 'important')

        const result = getTimedline(activityTarget)
        if (result == undefined) return

        const item = { ...result.content }
        const { index, target } = result

        item.start = f(x)

        if (item.end - item.start <= 1000) {
            item.start = item.end - 1000
        }

        if (
            timedlines[target][index - 1] != undefined &&
            item.start <= timedlines[target][index - 1].end
        ) {
            item.start = timedlines[target][index - 1].end
        }

        dispatch(
            TimedlinesActions.update([
                target,
                {
                    uhash: item.uhash,
                    content: { ...item }
                }
            ])
        )
    }

    const resizeRight = (x: number) => {
        if (activityTarget == null) return
        document.body.style.setProperty('cursor', 'e-resize', 'important')

        const result = getTimedline(activityTarget)
        if (result == undefined) return

        const item = { ...result.content }
        const { index, target } = result

        item.end = f(x)

        if (item.end >= duration) {
            item.end = duration
        }

        if (item.end - item.start <= 1000) {
            item.end = item.start + 1000
        }

        if (
            timedlines[target][index + 1] != undefined &&
            item.end >= timedlines[target][index + 1].start
        ) {
            item.end = timedlines[target][index + 1].start
        }

        dispatch(
            TimedlinesActions.update([
                target,
                {
                    uhash: item.uhash,
                    content: { ...item }
                }
            ])
        )
    }

    const handleMouseActivity = (e: MouseEvent) => {
        if (mouseActivity == 'inactive' || rootDiv.current == undefined) return
        const Xoffset = 64

        let x = e.clientX - Xoffset - activityInitialOffset + scrollLeft
        if (x < 0) x = 0

        if (mouseActivity == 'moving') movingTarget(x, e.clientY)
        else if (mouseActivity == 'resizeleft') resizeLeft(x)
        else if (mouseActivity == 'resizeright') resizeRight(x)
    }

    useEffect(() => {
        const mousemoveListener = (e: MouseEvent) => handleMouseActivity(e)

        const mouseupListener = () => {
            setMouseActivity('inactive')
            setActivityInitialOffset(0)
            document.body.style.removeProperty('cursor')

            if (session == null) return

            session.timedlines.primary.lines = timedlines.primary.map(
                (data) => new TimedLinesReferenceLine(data)
            )

            session.timedlines.secondary.lines = timedlines.secondary.map(
                (data) => new TimedLinesReferenceLine(data)
            )

            session.timedlines.update()
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
            className="flex z-10 overflow-y-hidden overflow-x-scroll flex-col grow bg-background-800 bg-gradient-to-b from-background-950 to-45% to-background-900"
        >
            <div className="flex flex-col grow relative" style={{ width: width + 'px' }}>
                <div
                    style={{ left: Math.floor((currentTime / duration) * width) + 'px' }}
                    className="top-0 min-w-1 h-full bg-text-800 opacity-85 absolute z-50"
                ></div>
                <div className="flex justify-between h-4 w-full" ref={state as any}>
                    <FocusEditorViewTimelineDetails
                        detailTime={detailTime}
                        duration={duration}
                        divwidth={width}
                    />
                </div>
                <div className="h-7 flex items-center relative grow w-full py-1">
                    {/* drag component acceptor */}
                    <DragToTimelineDrophandleComponent
                        timedlineTarget={'primary'}
                        scrollLeft={scrollLeft}
                        width={width}
                    />

                    {timedlines.primary.map((item, i) => (
                        <div
                            key={i}
                            id={`detail-item-${item.uhash}`}
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
                                    setActivityTarget(item.uhash)
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
                                    setActivityTarget(item.uhash)
                                    setMouseActivity('moving')
                                    findActivityOffset(item.uhash, e.clientX)
                                }}
                                className="flex justify-center grow-[1]"
                            >
                                <span className="text-text-400 select-none">
                                    {item.displayLineNumber}
                                </span>
                            </div>
                            <div
                                style={{
                                    cursor:
                                        mouseActivity == 'inactive' || activityTarget == i
                                            ? 'e-resize'
                                            : ''
                                }}
                                onMouseDown={(e) => {
                                    setActivityTarget(item.uhash)
                                    setMouseActivity('resizeright')
                                }}
                                className="right-0 absolute w-2 h-full"
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="h-7 flex items-center relative grow w-full py-1">
                    <DragToTimelineDrophandleComponent
                        timedlineTarget={'secondary'}
                        scrollLeft={scrollLeft}
                        width={width}
                    />

                    {timedlines.secondary.map((item, i) => (
                        <div
                            key={i}
                            id={`detail-item-${item.uhash}`}
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
                                    setActivityTarget(item.uhash)
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
                                    setActivityTarget(item.uhash)
                                    setMouseActivity('moving')
                                    findActivityOffset(item.uhash, e.clientX)
                                }}
                                className="flex justify-center grow-[1]"
                            >
                                <span className="text-text-400 select-none">
                                    {item.displayLineNumber}
                                </span>
                            </div>
                            <div
                                style={{
                                    cursor:
                                        mouseActivity == 'inactive' || activityTarget == i
                                            ? 'e-resize'
                                            : ''
                                }}
                                onMouseDown={(e) => {
                                    setActivityTarget(item.uhash)
                                    setMouseActivity('resizeright')
                                }}
                                className="right-0 absolute w-2 h-full"
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
