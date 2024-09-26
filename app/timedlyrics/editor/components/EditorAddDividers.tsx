'use client'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import { useAppDispatch } from '@/lib/hooks'
import { Fragment } from 'react'
import { useLocalState } from '../../LocalState'
import { TimedLyricLineItemData } from '@/app/cachedb/timedlyrics'
import { SpacelessString } from '../SpacelessString'

export default function Component() {
    const dispatch = useAppDispatch()
    const {
        session,
        activeLine,
        activeLyrics,
        lineStates: {
            lineState: { line, setLine },
            durationState: { duration }
        }
    } = useLocalState()

    const lyric = activeLyrics.find((item) => item[0] == activeLine)?.[1]!

    const slyric = SpacelessString.from(lyric)

    const hasLine = (idx: number) => {
        return line.findIndex((item) => item.offset == idx) !== -1
    }

    const toggleDividerLine = (idx: number) => {
        let lg = [...line]

        const offset = idx
        const lf = lg.find((item) => item.offset == offset)

        if (lf === undefined) {
            const min =
                lg
                    .filter((item) => offset > item.offset)
                    .sort((a, b) => a.offset - b.offset)
                    .pop()?.time ?? 0

            const max =
                lg
                    .filter((item) => offset < item.offset)
                    .sort((a, b) => b.offset - a.offset)
                    .pop()?.time ?? duration

            const item: TimedLyricLineItemData = {
                offset: offset,
                type: 'nospace',
                time: min + (max - min) / 2
            }

            lg.push(item)

            dispatch(
                TimedLyricsAction.add({
                    content: item
                })
            )
            dispatch(TimedLyricsAction.sort())
        } else {
            const indx = lg.findIndex((item) => item.offset === offset)
            lg = lg.filter((item) => item.offset !== offset)

            if (indx !== -1) {
                dispatch(
                    TimedLyricsAction.remove({
                        index: indx
                    })
                )

                dispatch(TimedLyricsAction.sort())
            }
        }

        lg.sort((a, b) => a.offset - b.offset)
        setLine(lg)
        if (session && activeLine !== null) {
            const timedlyrics = session.timedlyrics
            timedlyrics.lines[activeLine] = lg
            timedlyrics.update()
        }
    }

    return (
        <div className="h-full w-full flex items-center justify-center">
            {slyric.content.split('').map((char, idx) => (
                <Fragment key={idx}>
                    <span className="text-text-200 text-xl select-none">{char}</span>
                    <div
                        onClick={() => toggleDividerLine(idx + 1)}
                        style={{
                            minWidth: new Set(slyric.offsetSpaceMap).has(idx + 1)
                                ? '1.75rem'
                                : '0.50rem'
                        }}
                        className="flex flex-col gap-1 justify-center items-center h-32 cursor-pointer"
                    >
                        <div
                            className="w-[2px] h-[2px] bg-text-500"
                            style={{
                                display: hasLine(idx + 1) ? 'flex' : 'none'
                            }}
                        ></div>
                    </div>
                </Fragment>
            ))}
        </div>
    )
}
