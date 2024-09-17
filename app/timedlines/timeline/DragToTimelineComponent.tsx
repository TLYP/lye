import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as DragToTimelineActions from '@/lib/local/dragToTimeline'

export function DragToTimelineDrophandleComponent() {
    const active = useAppSelector((state) => state.dragToTimeline.active)
    const [dragElement, setDragElement] = useState<HTMLDivElement | null>(null)
    const elementShadowPreview = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (active === undefined) return
        const element = document.getElementById(String(active.uhash)) as HTMLDivElement | null
        setDragElement(element)
    }, [active])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (elementShadowPreview.current == null || dragElement == null) return

            elementShadowPreview.current.style.left = e.clientX + 'px'
        }

        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    })

    if (active === undefined) return <></>

    return <div ref={elementShadowPreview} className="absolute w-10 h-8 bg-text-50"></div>
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
            if (action == 'moving') dispatch(DragToTimelineActions.clearActive())
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
                setAction('holding')
                moveElementToMouse(e as unknown as MouseEvent)
            }}
            className="border-background-950 border-y-[1px] flex w-full cursor-pointer hover:bg-background-800"
        >
            <div
                ref={draggablyElementRef}
                id={String(uhash)}
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
