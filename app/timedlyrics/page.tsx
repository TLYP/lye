'use client'
import { useAppSelector } from '@/lib/hooks'
import { LoadRelevantState } from './StateLoader'
import LinenumberColumnComponent from './components/LinenumberColumnComponent'
import LyricColumnComponent from './components/LyricColumnComponent'

function LyricsView() {
    const activeLyric = useAppSelector((state) => state.lyrics.active)

    return (
        <>
            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, idx) => (
                    <LinenumberColumnComponent
                        key={idx}
                        linenumber={lyric[0]}
                        displaylinenumber={idx + 1}
                    />
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, idx) => (
                    <LyricColumnComponent key={idx} linenumber={lyric[0]} lyric={lyric[1]} />
                ))}
            </div>
        </>
    )
}

export default function Page() {
    return (
        <div className="flex flex-col items-center gap-4 pb-52 bg-background-base w-screen h-full py-6 overflow-y-auto overflow-x-hidden">
            <LoadRelevantState />
            <div className="flex gap-1">
                <LyricsView />
            </div>
        </div>
    )
}
