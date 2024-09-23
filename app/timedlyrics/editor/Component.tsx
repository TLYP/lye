import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { Fragment, useEffect, useRef, useState } from 'react'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import NoSpaceStepIcon from '@/app/components/icons/NoSpaceSep'
import SpaceStepIcon from '@/app/components/icons/SpaceSep'
import { TimedLyricLineData } from '../../cachedb/timedlyrics'
import FocusEditorViewTimelineDetails from '../TimelineDetailsComponent'

export default function TimedLyricEditor() {
    const dispatch = useAppDispatch()
    const activeLine = useAppSelector((state) => state.timedlyrics.activeLine)
    const timedlines = useAppSelector((state) => state.timedlines)
    const activeLyrics = useAppSelector((state) => state.lyrics.active)
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
