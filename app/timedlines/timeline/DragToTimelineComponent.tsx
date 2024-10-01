import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as DragToTimelineActions from '@/lib/local/dragToTimeline'
import * as TimedlinesActions from '@/lib/timedlines'

export function DragToTimelineDrophandleComponent({
    scrollLeft,
    width,
    timedlineTarget
}: {
    width: number
    scrollLeft: number
    timedlineTarget: TimedlinesActions.TimelineTarget
}) {
    const dispatch = useAppDispatch()
    const active = useAppSelector((state) => state.dragToTimeline.active)
    const timedlines = useAppSelector((state) => state.timedlines)
    const elementShadowPreview = useRef<HTMLDivElement>(null)
    const duration = useAppSelector((state) =>
        Math.floor((state.audioPlayer.audio?.duration ?? 0) * 1000)
    )
    const [dragElement, setDragElement] = useState<HTMLDivElement | null>(null)
    /** px to ms */
    const f = (x: number) => duration * (x / width)
    /** ms to px */
    const g = (x: number) => width * (x / duration)

    useEffect(() => {
        if (active === undefined) return
        const element = document.getElementById(String(active.uhash)) as HTMLDivElement | null
        setDragElement(element)
    }, [active])

    useEffect(() => {
        const offset = 64
        let shadowItemReplacement: null | { start: number; end: number } = null

        const findNearestRight = (linenumber: number) =>
            timedlines[timedlineTarget]
                .filter((item) => item.linenumber > linenumber)
                .map((item) => ({
                    val: Math.abs(item.linenumber - linenumber),
                    item
                }))
                .sort((i1, i2) => i2.val - i1.val)
                .pop()?.item

        const findNearestLeft = (linenumber: number) =>
            timedlines[timedlineTarget]
                .filter((item) => item.linenumber < linenumber)
                .map((item) => ({
                    val: Math.abs(item.linenumber - linenumber),
                    item
                }))
                .sort((i1, i2) => i2.val - i1.val)
                .pop()?.item

        const handleMouseMove = (e: MouseEvent) => {
            if (elementShadowPreview.current == null || dragElement == null || active == null)
                return (shadowItemReplacement = null)
            const elementShadow = elementShadowPreview.current

            const bodyHeight = document.body.getBoundingClientRect().height

            if (
                (timedlineTarget == 'primary' &&
                    (e.clientY <= bodyHeight - 100 || e.clientY >= bodyHeight - 34)) ||
                (timedlineTarget == 'secondary' && e.clientY <= bodyHeight - 34)
            )
                return (elementShadow.style.display = 'none'), (shadowItemReplacement = null)

            let width = g(5000)
            const leftLine = findNearestLeft(active.linenumber)
            const rightLine = findNearestRight(active.linenumber)

            if (
                leftLine != null &&
                rightLine != null &&
                f(width) >= rightLine.start - leftLine.end
            ) {
                width = g(rightLine.start - leftLine.end)
            }

            if (f(Math.floor(width)) < 1000) return (shadowItemReplacement = null)

            const xoffset = offset + width / 2
            let x = e.clientX + scrollLeft - xoffset
            if (x <= 0) x = 0

            if (leftLine != null && f(x) < leftLine.end) x = g(leftLine.end)
            if (rightLine != null && f(x) + f(width) > rightLine.start)
                x = g(rightLine.start) - width

            elementShadow.style.left = x + 'px'
            elementShadow.style.width = width + 'px'
            elementShadow.style.display = 'flex'
            shadowItemReplacement = { start: f(x), end: f(x) + f(width) }
        }

        const handleMouseUp = (e: MouseEvent) => {
            const bodyHeight = document.body.getBoundingClientRect().height

            if (e.clientY <= bodyHeight - 100) dispatch(DragToTimelineActions.clearActive())

            if (elementShadowPreview.current == null || dragElement == null || active == null)
                return

            const elementShadow = elementShadowPreview.current

            if (shadowItemReplacement == null) return (elementShadow.style.display = 'none')
            if (active != null) dispatch(DragToTimelineActions.clearActive())

            elementShadow.style.display = 'none'

            dispatch(
                TimedlinesActions.add([
                    timedlineTarget,
                    {
                        displayLineNumber: active.linenumber,
                        start: shadowItemReplacement.start,
                        end: shadowItemReplacement.end,
                        linenumber: active.linenumber,
                        uhash: active.uhash
                    }
                ])
            )
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    })

    return (
        <div
            ref={elementShadowPreview}
            className="absolute w-10 h-8 bg-background-700 opacity-35 hidden rounded"
        ></div>
    )
}

export default function Component({
    content,
    dragcontent,
    linenumber,
    uhash
}: {
    content: string
    dragcontent: string
    linenumber: number
    uhash: number
}) {
    const [action, setAction] = useState<'holding' | 'moving' | null>(null)
    const draggablyElementRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()

    const timedlines = useAppSelector((state) => state.timedlines)

    const lineInTimeline = (uhash: number) =>
        timedlines.primary.findIndex((item) => item.uhash == uhash) !== -1 ||
        timedlines.secondary.findIndex((item) => item.uhash == uhash) !== -1

    const moveElementToMouse = (e: MouseEvent) => {
        if (draggablyElementRef.current == null) return

        const bodyBoundaryBox = document.body.getBoundingClientRect()
        const elementBoundaryBox = draggablyElementRef.current.getBoundingClientRect()
        const elementWidth = elementBoundaryBox.width
        const elementHeight = elementBoundaryBox.height

        let cx = e.clientX
        let cy = e.clientY

        if (cx <= elementWidth / 2) cx = elementWidth / 2
        if (cx >= bodyBoundaryBox.width - elementWidth / 2)
            cx = bodyBoundaryBox.width - elementWidth / 2
        if (cy <= elementHeight / 2) cy = elementHeight / 2
        if (cy >= bodyBoundaryBox.height - elementHeight / 2)
            cy = bodyBoundaryBox.height - elementHeight / 2

        const x = cx - elementWidth / 2
        const y = cy - elementHeight / 2

        draggablyElementRef.current.style.left = x + 'px'
        draggablyElementRef.current.style.top = y + 'px'
    }

    useEffect(() => {
        const handleMouseUp = () => {
            setAction(null)
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (action == null || draggablyElementRef.current == null) return
            if (action == 'holding')
                dispatch(DragToTimelineActions.setActive({ uhash, linenumber }))
            setAction('moving')
            moveElementToMouse(e)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove)
        }
    })
    return (
        <div>
            <div
                ref={draggablyElementRef}
                id={String(uhash)}
                data-linenumber={linenumber}
                className="w-32 opacity-50 z-[999] justify-center border-background-950 border-[1px] items-center rounded-sm absolute bg-background-800 px-3 py-2"
                style={{ display: action == 'moving' ? 'flex' : 'none' }}
            >
                <span className="select-none text-xs text-text-300">{dragcontent}</span>
            </div>

            <div
                onMouseDown={(e) => {
                    if (lineInTimeline(uhash)) return
                    setAction('holding')
                    moveElementToMouse(e as unknown as MouseEvent)
                }}
                className="border-background-950 border-y-[1px] flex w-full cursor-pointer"
                style={{
                    cursor: lineInTimeline(uhash) ? 'cursor' : 'default',
                    opacity: lineInTimeline(uhash) ? '1' : '0.3'
                    // paddingLeft: lineInTimelineTarget(uhash) == 'secondary' ? '1rem' : ''
                }}
            >
                <div className="p-2 px-4">
                    <span className="text-xl text-text-300 select-none">{content}</span>
                </div>
            </div>
        </div>
    )
}
