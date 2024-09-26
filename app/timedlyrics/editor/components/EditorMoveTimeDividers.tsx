'use client'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import { useAppDispatch } from '@/lib/hooks'
import { useEffect } from 'react'
import { useLocalState } from '../../LocalState'

export default function Component() {
    const dispatch = useAppDispatch()
    const {
        session,
        activeLine,
        editor: {
            rootDiv,
            widthState: { width }
        },
        lineStates: {
            lineState: { line },
            durationState: { duration }
        },
        mouseStates: {
            targetState: { target, setTarget },
            targetActionState: { targetAction, setTargetAction }
        }
    } = useLocalState()
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

            if (session == null || activeLine == null) return
            const timedlyrics = session.timedlyrics
            timedlyrics.lines[activeLine] = line
            timedlyrics.update()
        }

        document.addEventListener('mousemove', mousemoveHandler)
        document.addEventListener('mouseup', mouseupHandler)

        return () => {
            document.removeEventListener('mousemove', mousemoveHandler)
            document.removeEventListener('mouseup', mouseupHandler)
        }
    })

    return <></>
}
