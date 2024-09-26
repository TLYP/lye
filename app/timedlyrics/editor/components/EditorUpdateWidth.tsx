'use client'
import { useEffect } from 'react'
import { useLocalState } from '../../LocalState'

export default function Component() {
    const {
        editor: {
            rootDiv,
            widthState: { width, setWidth },
            focusWidthState: { setFocusWidth },
            detailTimeState: { detailTime },
            extradetailsState: { extradetails }
        },
        lineStates: {
            durationState: { duration }
        }
    } = useLocalState()

    useEffect(() => {
        if (!rootDiv.current) return
        const w = rootDiv.current.getBoundingClientRect().width
        if (width == 0) setWidth(w)

        const durationScaled = duration - (duration % detailTime) // properly scaled duration
        const details = extradetails * Math.floor(durationScaled / detailTime) + 1

        const gapsize = 5

        setFocusWidth(w < gapsize * details ? gapsize * details : w)
    }, [rootDiv, width, duration])

    return <></>
}
