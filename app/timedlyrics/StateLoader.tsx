'use client'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useEffect } from 'react'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import * as TimedlinesActions from '@/lib/timedlines'
import * as LyricsActions from '@/lib/lyrics'
import { TimedLyricLineData } from '../cachedb/timedlyrics'
import { Session } from '../cachedb/sessions'

function LoadActiveLyric() {
    const dispatch = useAppDispatch()
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)

    useEffect(() => {
        if (everyLyrics == null) return
        const lyric = everyLyrics.find((i) => i.uuid == activeSession?.lyricRef)
        if (!lyric) return

        let data = lyric.lines.map((i) => i['content'])
        let ndata = data.map((item, i) => [i + 1, item]) as Array<[number, string]>
        ndata = ndata.filter((item) => !item[1].startsWith('['))
        ndata = ndata.filter((item) => !(item[1].trim() === ''))

        dispatch(LyricsActions.setActive(ndata))
    }, [activeSession, everyLyrics])

    return <></>
}

export function LoadRelevantState() {
    const dispatch = useAppDispatch()

    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)

    useEffect(() => {
        dispatch(TimedLyricsAction.setActive(4))
        const data: Record<string, TimedLyricLineData> = {
            4: [
                { offset: 5, type: 'space', time: 1 * 1000 },
                { offset: 10, type: 'nospace', time: 2 * 1000 },
                { offset: 14, type: 'space', time: 3 * 1000 },
                { offset: 21, type: 'space', time: 4 * 1000 }
            ]
        }
        dispatch(TimedLyricsAction.loadAll(data))
    }, [])

    useEffect(() => {
        if (everyLyrics == null) return
        const lyric = everyLyrics.find((i) => i.uuid == activeSession?.lyricRef)
        if (!lyric) return

        let data = lyric.lines.map((i) => i['content'])
        data = data.map((item, i) => [i + 1, item]) as any
        data = data.filter((item) => !item[1].startsWith('['))
        data = data.filter((item) => !(item[1].trim() === ''))
        ;(async () => {
            if (activeSession === null) return

            const session = await Session.get(activeSession.uuid)
            const timedlines = session.timedlines.serialize().timelines

            dispatch(TimedlinesActions.loadAll(timedlines))
        })()
    }, [everyLyrics, activeSession])

    return (
        <>
            <LoadActiveLyric />
        </>
    )
}
