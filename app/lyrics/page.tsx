'use client'
import { Button, Text, Tooltip } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { diffArrays } from 'diff'
import { IconInfoCircle } from '@tabler/icons-react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import * as Lyrics from '@/lib/lyrics'
import { Session } from '../cachedb/sessions'

export default function Page() {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const everyLyrics = useAppSelector((state) => state.lyrics.lyrics)
    const [activeLyric, setActiveLyric] = useState<string>('')
    const dispatch = useAppDispatch()
    const [mapped, setMapped] = useState(['', ''])
    const [value, setValue] = useState<null | string>(null)
    const textarea = useRef<HTMLTextAreaElement>()

    useEffect(() => {
        if (everyLyrics == null) return
        const lyric = everyLyrics.find((i) => i.uuid == activeSession?.lyricRef)
        if (!lyric) return

        const data = lyric.lines.map((i) => i['content']).join('\n')

        setActiveLyric(data)
        setValue(data)
    }, [everyLyrics, activeSession])

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

        let v = updates.map((t) => (t[0] == t[1] ? (t[2] ? '+' : ' ') : t[1]))
        setMapped(v)
    }

    const saveHandle = async () => {
        setMapped([])
        if (activeSession == null || value == null) return
        const session = await Session.get(activeSession.uuid)

        const lines = value.split('\n').map((t) => ({
            content: t,
            chash: 0,
            lhash: 0,
            uhash: 0
        }))

        session.lyric.lines = lines
        await session.lyric.update()

        dispatch(
            Lyrics.updateLyric({
                lines,
                uuid: activeSession.lyricRef
            })
        )
    }

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
                            ref={textarea as any}
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
