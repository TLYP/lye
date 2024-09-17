'use client'
import PlayerComponent from './PlayerComponent'
import Link from 'next/link'
import SourceSelect from './sourceSelect'
import * as Sessions from '@/lib/sessions'
import * as Lyrics from '@/lib/lyrics'
import { useEffect } from 'react'
import { Session } from '@/app/cachedb/sessions'
import { useAppDispatch } from '@/lib/hooks'
import { Lyric } from '@/app/cachedb/lyrics'

function StageChip({ name, path }: { name: string; path: string }) {
    return (
        <Link
            href={path}
            className="flex justify-center items-center w-28 h-8 bg-background-900  rounded-md"
        >
            <span className="text-text-500 text-sm font-bold">{name}</span>
        </Link>
    )
}

export default function Header() {
    const dispatch = useAppDispatch()
    useEffect(() => {
        ;(async () => {
            const session = await Session.getActiveSession()
            if (!session) return

            dispatch(Sessions.loadAll((await Session.getAll()).map((i) => i.serialize())))
            dispatch(Sessions.setActiveSession(session.serialize()))
            dispatch(Lyrics.loadAll((await Lyric.getAll()).map((i) => i.serialize())))
        })()
    })

    return (
        <div className="flex bg-background-base border-b-2 border-background-900">
            <SourceSelect />
            <div className="flex w-full h-12">
                <PlayerComponent />
            </div>
            <div className="flex items-center gap-6 h-12 px-16">
                <StageChip path="/metadata" name="Metadata" />
                <StageChip path="/lyrics" name="Add Lyrics" />
                <StageChip path="/timedlines" name="Timed Lines" />
                <StageChip path="/timedlyrics" name="Timed Lyrics" />
            </div>
        </div>
    )
}
