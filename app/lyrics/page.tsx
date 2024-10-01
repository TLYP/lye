'use client'
import { Button, Text, Tooltip } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { diffArrays } from 'diff'
import { IconInfoCircle } from '@tabler/icons-react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import * as Lyrics from '@/lib/lyrics'
import * as TimedlinesActions from '@/lib/timedlines'
import { Session, SessionReference } from '../cachedb/sessions'
import { cyrb53 } from '../cachedb'
import { TimedLinesReferenceLine } from '../cachedb/timedlines'

export default function Page() {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const [session, setSession] = useState<null | SessionReference>(null)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
    const timedlines = useAppSelector((state) => state.timedlines)
    const dispatch = useAppDispatch()
    const [activeLyric, setActiveLyric] = useState<string>('')
    const [mapped, setMapped] = useState(['', ''])
    const [value, setValue] = useState<null | string>(null)
    const textarea = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (activeSession == null) return
        ;(async () => {
            setSession(await Session.get(activeSession.uuid))
        })()
    }, [activeSession])

    useEffect(() => {
        if (everyLyrics == null) return
        const lyric = everyLyrics.find((i) => i.uuid == activeSession?.lyricRef)
        if (!lyric) return

        const data = lyric.lines.map((i) => i['content']).join('\n')

        setActiveLyric(data)
        setValue(data)
    }, [everyLyrics, activeSession])

    useEffect(() => {
        ;(async () => {
            if (activeSession === null) return

            const session = await Session.get(activeSession.uuid)
            const timedlines = session.timedlines.serialize().timelines

            dispatch(TimedlinesActions.loadAll(timedlines))
        })()
    }, [everyLyrics, activeSession, dispatch])

    const onchange = () => {
        const text = textarea!.current!.value
        setValue(text)
        const content = text
            .split('\n')
            .map((t) => t.trim())
            .join('\n')
        doDiffCheck(content)
    }

    const doDiffCheck = (content: string) => {
        const valuearr = activeLyric.split('\n')
        const contentarr = content.split('\n')

        const diffs = diffArrays(valuearr, contentarr)
        let linenum = 1
        let lineoffset = 0

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any[] = []

        for (let i = 0; i < diffs.length; i++) {
            const diff = diffs[i]

            if (diff.removed) {
                lineoffset += diff.value.length
                continue
            }

            if (diff.added) {
                lineoffset -= diff.count!

                for (let j = 0; j < diff.value.length; j++) {
                    updates.push([linenum, linenum + lineoffset - lineoffset, true, diff.value[j]])
                    linenum++
                }

                continue
            }

            for (let j = 0; j < diff.value.length; j++) {
                updates.push([linenum, linenum + lineoffset, false, diff.value[j]])
                linenum++
            }
        }

        const v = updates.map((t) => {
            if (t[0] == t[1]) return t[2] ? '+' : ' '

            const item =
                timedlines.primary.find((it) => it.linenumber === t[1]) ||
                timedlines.secondary.find((it) => it.linenumber === t[1])

            if (item === undefined) return ' '

            return t[1]
        })
        setMapped(v)
    }

    const saveHandle = async () => {
        if (activeSession == null || value == null) return
        const session = await Session.get(activeSession.uuid)

        const lines = value.split('\n').map((t, i) => ({
            content: t,
            uhash: cyrb53(`${i + 1}-${t}`)
        }))

        session.lyric.lines = lines
        await session.lyric.update()

        dispatch(
            Lyrics.updateLyric({
                lines,
                uuid: activeSession.lyricRef
            })
        )

        for (let i = 0; i < mapped.length; i++) {
            const oldLn = mapped[i]
            const newLn = i + 1
            if (typeof oldLn == 'string') continue
            ;(['primary', 'secondary'] as const).map((target) => {
                const item = timedlines[target].find((it) => it.linenumber == oldLn)
                if (item === undefined) return
                const line = lines[newLn - 1]

                dispatch(
                    TimedlinesActions.update([
                        target,
                        {
                            uhash: item.uhash,
                            content: {
                                ...item,
                                linenumber: newLn,
                                uhash: line.uhash
                            }
                        }
                    ])
                )
            })
        }

        setMapped([])
    }

    useEffect(() => {
        if (!session) return
        session.timedlines.primary.lines = timedlines.primary.map(
            (data) => new TimedLinesReferenceLine(data)
        )

        session.timedlines.secondary.lines = timedlines.secondary.map(
            (data) => new TimedLinesReferenceLine(data)
        )

        session.timedlines.update()
    }, [timedlines])

    return (
        <div className="flex flex-col items-center gap-4 bg-background-base w-full h-full py-6 overflow-y-scroll">
            {value == null ? (
                <>Getting locally stored</>
            ) : (
                <>
                    <div className="flex gap-3 bg-background-900 py-3 px-1 w-fit h-fit rounded-lg">
                        <div className="flex items-end flex-col w-6 text-text-500">
                            {value.split('\n').map((_, idx) =>
                                idx >= 1 &&
                                value.split('\n')[idx].startsWith('[') &&
                                value.split('\n')[idx].endsWith(']') &&
                                value.split('\n')[idx - 1].trim() != '' ? (
                                    <Tooltip
                                        color="yellow"
                                        key={idx}
                                        label={
                                            <div className="flex gap-1 items-center">
                                                <IconInfoCircle />
                                                should include empty line above
                                            </div>
                                        }
                                        position="left"
                                    >
                                        <span
                                            className="flex items-center cursor-default"
                                            style={{ height: '28px' }}
                                        >
                                            <Text variant="text" c={'orange'}>
                                                {idx + 1}
                                            </Text>
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <span
                                        key={idx}
                                        className="flex items-center cursor-default"
                                        style={{ height: '28px' }}
                                    >
                                        <Text variant="text">{idx + 1}</Text>
                                    </span>
                                )
                            )}
                        </div>
                        <textarea
                            className={'text-text-300 text-lg'}
                            ref={textarea}
                            onChange={onchange}
                            value={value}
                            style={{
                                width: '700px',
                                backgroundColor: 'transparent',
                                outline: 'none',
                                textWrap: 'nowrap',
                                resize: 'none'
                            }}
                        />

                        <div className="flex items-start flex-col w-6 text-text-300">
                            {mapped.map((i, idx) => (
                                <span
                                    className="flex items-center"
                                    key={idx}
                                    style={{ height: '28px' }}
                                >
                                    {i}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ width: '780px' }}>
                        <Button disabled={mapped.length == 0} onClick={saveHandle}>
                            Save
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
