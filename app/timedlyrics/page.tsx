'use client'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import { LoadRelevantState } from './StateLoader'
import TimedLyricEditor from './editor/Component'

export function LyricsViewLineNumberCol({
    linenumber,
    displaylinenumber
}: {
    linenumber: number
    displaylinenumber: number
}) {
    const activeLine = useAppSelector((state) => state.timedlyrics.activeLine)
    const timedlines = useAppSelector((state) => state.timedlines)

    const hasLine = () => {
        return (
            [...timedlines.primary, ...timedlines.secondary].findIndex(
                (item) => item.linenumber == linenumber
            ) !== -1
        )
    }

    return (
        <div className="border-background-950 w-[44px] border-y-[1px] flex flex-col">
            <div className="flex items-center justify-center p-2 px-4 h-[44px] w-full">
                <span
                    className="select-none"
                    style={{
                        color: hasLine()
                            ? activeLine == linenumber
                                ? 'var(--text-100)'
                                : 'var(--text-300)'
                            : 'var(--text-800)'
                    }}
                >
                    {displaylinenumber}
                </span>
            </div>
            <div
                style={{ display: linenumber === activeLine ? 'flex' : 'none' }}
                className="h-24 z-30  w-full bg-background-base border-background-950 border-t-[2px]"
            ></div>
        </div>
    )
}

export function LyricsViewLyricColumn({
    linenumber,
    lyric
}: {
    linenumber: number
    lyric: string
}) {
    const dispatch = useAppDispatch()

    const activeLine = useAppSelector((state) => state.timedlyrics.activeLine)
    const timedlines = useAppSelector((state) => state.timedlines)

    const hasLine = () => {
        return (
            [...timedlines.primary, ...timedlines.secondary].findIndex(
                (item) => item.linenumber == linenumber
            ) !== -1
        )
    }

    return (
        <div
            onClick={() => {
                if (activeLine == linenumber || !hasLine()) return
                dispatch(TimedLyricsAction.setActive(linenumber))
            }}
            className="border-background-950 min-w-[700px] border-y-[1px] flex flex-col w-full"
            style={{
                cursor: hasLine() ? (activeLine == linenumber ? 'default' : 'pointer') : 'default'
            }}
        >
            <div className="p-2 px-4">
                <span
                    style={{
                        color: hasLine()
                            ? activeLine == linenumber
                                ? 'var(--text-200)'
                                : 'var(--text-300)'
                            : 'var(--text-800)'
                    }}
                    className="text-xl select-none"
                >
                    {lyric}
                </span>
            </div>

            {linenumber === activeLine && <TimedLyricEditor />}
        </div>
    )
}

function LyricsView() {
    const activeLyric = useAppSelector((state) => state.lyrics.active)

    return (
        <>
            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, idx) => (
                    <LyricsViewLineNumberCol
                        key={idx}
                        linenumber={lyric[0]}
                        displaylinenumber={idx + 1}
                    />
                ))}
            </div>

            <div className="rounded bg-background-900">
                {activeLyric.map((lyric, idx) => (
                    <LyricsViewLyricColumn key={idx} linenumber={lyric[0]} lyric={lyric[1]} />
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
