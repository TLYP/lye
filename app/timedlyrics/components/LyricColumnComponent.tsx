'use client'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import TimedLyricEditor from '../editor/Component'

export default function Component({ linenumber, lyric }: { linenumber: number; lyric: string }) {
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
