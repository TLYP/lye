'use client'
import { useEffect } from 'react'
import { useLocalState } from '../../LocalState'

export default function Component() {
    const {
        editor: {
            rootDiv,
            widthState: { width, setWidth },
            focusWidthState: { setFocusWidth }
        },
        lineStates: {
            durationState: { duration }
        }
    } = useLocalState()

    useEffect(() => {
        if (!rootDiv.current) return
        const w = rootDiv.current.getBoundingClientRect().width
        if (width == 0) setWidth(w)

        setFocusWidth(w)
    }, [rootDiv, width, duration])

    return <></>
}
