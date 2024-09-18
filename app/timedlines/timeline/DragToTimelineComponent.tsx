import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as DragToTimelineActions from '@/lib/local/dragToTimeline'

export function DragToTimelineDrophandleComponent({
    setTimedlines,
    timedlines,
    scrollLeft,
    width
}: {
    width: number
    scrollLeft: number
    timedlines: Array<{
        start: number
        end: number
        linenumber: number
        uhash: number
    }>
    setTimedlines: Dispatch<
        SetStateAction<
            Array<{
                start: number
                end: number
                linenumber: number
                uhash: number
            }>
        >
    >
}) {
    const dispatch = useAppDispatch()
    const active = useAppSelector((state) => state.dragToTimeline.active)
    const elementShadowPreview = useRef<HTMLDivElement>(null)
    const duration = useAppSelector((state) =>
        Math.floor((state.audioPlayer.audio?.duration ?? 0) * 1000)
    )
    const [dragElement, setDragElement] = useState<HTMLDivElement | null>(null)
    const f = (x: number) => duration * (x / width) // px to ms
    const g = (x: number) => width * (x / duration) // ms to px

    useEffect(() => {
        if (active === undefined) return
        const element = document.getElementById(String(active.uhash)) as HTMLDivElement | null
        setDragElement(element)
    }, [active])

    useEffect(() => {
        let offset = 64

        const findNearestLeft = (linenumber: number) => {
            let cursorIndex = null

            for (const { item, index } of timedlines.map((item, index) => ({ index, item }))) {
                if (item.linenumber < linenumber) {
                    if (cursorIndex == null) cursorIndex = index
                    else if (
                        Math.abs(item.linenumber - linenumber) <
                        Math.abs(timedlines[cursorIndex].linenumber - linenumber)
                    )
                        cursorIndex = index
                    else continue
                }
            }

            if (cursorIndex == null) return null
            return timedlines[cursorIndex]
        }

        const findNearestRight = (linenumber: number) => {
            let cursorIndex = null

            for (const { item, index } of timedlines.map((item, index) => ({ index, item }))) {
                if (item.linenumber > linenumber) {
                    if (cursorIndex == null) cursorIndex = index
                    else if (
                        Math.abs(item.linenumber - linenumber) <
                        Math.abs(timedlines[cursorIndex].linenumber - linenumber)
                    )
                        cursorIndex = index
                    else continue
                }
            }

            if (cursorIndex == null) return null
            return timedlines[cursorIndex]
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (elementShadowPreview.current == null || dragElement == null || active == null)
                return
            const elementShadow = elementShadowPreview.current

            if (e.clientY <= document.body.getBoundingClientRect().height - 100)
                return (elementShadow.style.display = 'none')

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

            if (f(Math.floor(width)) < 1000) return

            let xoffset = offset + width / 2
            let x = e.clientX + scrollLeft - xoffset
            if (x <= 0) x = 0

            if (leftLine != null && f(x) < leftLine.end) x = g(leftLine.end)
            if (rightLine != null && f(x) + f(width) > rightLine.start)
                x = g(rightLine.start) - width

            elementShadow.style.left = x + 'px'
            elementShadow.style.width = width + 'px'
            elementShadow.style.display = 'flex'
        }

        const handleMouseUp = (e: MouseEvent) => {
            if (active != null) dispatch(DragToTimelineActions.clearActive())
            if (elementShadowPreview.current == null || dragElement == null || active == null)
                return

            const elementShadow = elementShadowPreview.current

            if (e.clientY <= document.body.getBoundingClientRect().height - 100)
                return (elementShadow.style.display = 'none')
            const linenumber = active.linenumber
            const uhash = active.uhash

            elementShadow.style.display = 'none'

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

            if (f(Math.floor(width)) < 1000) return

            let xoffset = offset + width / 2
            let x = e.clientX + scrollLeft - xoffset
            if (x <= 0) x = 0

            if (leftLine != null && f(x) < leftLine.end) x = g(leftLine.end)
            if (rightLine != null && f(x) + f(width) > rightLine.start)
                x = g(rightLine.start) - width

            const xms = f(x) // position as milliseconds
            setTimedlines((items) => {
                const nitems = [
                    ...items,
                    {
                        start: xms,
                        end: xms + f(width),
                        linenumber,
                        uhash
                    }
                ]
                return nitems.sort((i1, i2) => i1.linenumber - i2.linenumber)
            })

            elementShadow.style.left = x + 'px'
            elementShadow.style.width = width + 'px'
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
    uhash,
    timedlines
}: {
    content: string
    dragcontent: string
    linenumber: number
    uhash: number
    timedlines: Array<{ start: number; end: number; linenumber: number; uhash: number }>
}) {
    const [action, setAction] = useState<'holding' | 'moving' | null>(null)
    const draggablyElementRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()

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

        let x = cx - elementWidth / 2
        let y = cy - elementHeight / 2

        draggablyElementRef.current.style.left = x + 'px'
        draggablyElementRef.current.style.top = y + 'px'
    }

    useEffect(() => {
        const handleMouseUp = (e: MouseEvent) => {
            // if (action == 'moving') dispatch(DragToTimelineActions.clearActive())
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
        <div
            onMouseDown={(e) => {
                const intimedlines =
                    timedlines.findIndex((it) => it.linenumber == linenumber) !== -1

                if (intimedlines) return
                setAction('holding')
                moveElementToMouse(e as unknown as MouseEvent)
            }}
            className="border-background-950 border-y-[1px] flex w-full cursor-pointer"
            style={{
                cursor:
                    timedlines.findIndex((it) => it.linenumber == linenumber) === -1
                        ? 'cursor'
                        : 'default',
                backgroundColor:
                    timedlines.findIndex((it) => it.linenumber == linenumber) === -1
                        ? 'var(--background-950)'
                        : ''
            }}
        >
            <div
                ref={draggablyElementRef}
                id={String(uhash)}
                data-linenumber={linenumber}
                className="z-10 justify-center border-background-950 border-[1px] items-center rounded-sm absolute bg-background-800 px-3 py-2"
                style={{ display: action == 'moving' ? 'flex' : 'none' }}
            >
                <span className="select-none text-xs text-text-300">{dragcontent}</span>
            </div>
            <div className="p-2 px-4">
                <span className="text-xl text-text-300 select-none">{content}</span>
            </div>
        </div>
    )
}
