'use client'
import { useEffect } from 'react'
import { useLocalState } from '../../LocalState'
import { SpacelessString } from '../SpacelessString'

export default function EditorUpdateSlices() {
    const {
        activeLine,
        activeLyrics,
        editor: {
            slicesState: { setSlices },
            focusWidthState: { focusWidth }
        },
        lineStates: {
            lineState: { line },
            durationState: { duration }
        }
    } = useLocalState()

    useEffect(() => {
        if (focusWidth == 0) return
        let oset = 0
        let pt = 0
        let nslices = []

        const lyric = activeLyrics.find((item) => item[0] == activeLine)?.[1]
        if (!lyric) return
        const slyric = SpacelessString.from(lyric)

        for (let i = 0; i < line.length; i++) {
            const timedlyric = line[i]
            nslices.push({
                type: 'content',
                content: slyric.spacelessSlice(oset, timedlyric.offset).toString().trim(),
                width: ((timedlyric.time - pt) / duration) * focusWidth
            })
            nslices.push({ type: timedlyric.type, targetIndex: i })

            oset = timedlyric.offset
            pt = timedlyric.time
        }

        nslices.push({
            type: 'content',
            content: slyric.spacelessSlice(oset).toString(),
            width: ((duration - pt) / duration) * focusWidth
        })

        setSlices(() => {
            return [...nslices] as any
        })
    }, [duration, focusWidth, line])

    return <></>
}
