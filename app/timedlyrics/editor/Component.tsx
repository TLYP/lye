import { useAppDispatch } from '@/lib/hooks'
import { Fragment, useEffect, useState } from 'react'
import * as TimedLyricsAction from '@/lib/timedlyrics'
import NoSpaceStepIcon from '@/app/components/icons/NoSpaceSep'
import SpaceStepIcon from '@/app/components/icons/SpaceSep'
import FocusEditorViewTimelineDetails from '../TimelineDetailsComponent'
import { ActionIcon, Switch } from '@mantine/core'
import { useLocalState, StateEditorSlice } from '../LocalState'
import { IconAdjustments } from '@tabler/icons-react'

function EditorUpdateSlices() {
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

        for (let i = 0; i < line.length; i++) {
            const timedlyric = line[i]
            nslices.push({
                type: 'content',
                content: lyric.slice(oset, timedlyric.offset).trim(),
                width: ((timedlyric.time - pt) / duration) * focusWidth
            })
            nslices.push({ type: timedlyric.type, targetIndex: i })

            oset = timedlyric.offset
            pt = timedlyric.time
        }

        nslices.push({
            type: 'content',
            content: lyric.slice(oset).trim(),
            width: ((duration - pt) / duration) * focusWidth
        })

        setSlices(() => {
            return [...nslices] as any
        })
    }, [duration, focusWidth, line])

    return <></>
}

function SliceContentComponent({ idx, slice }: { idx: number; slice: StateEditorSlice[0] }) {
    return (
        <div
            className="flex justify-center overflow-hidden rounded-sm"
            id={'slice-content-item'}
            style={{
                maxWidth: (slice.width ?? 0) - (idx / 2) * 1 ?? 'px',
                minWidth: (slice.width ?? 0) - (idx / 2) * 1 ?? 'px'
            }}
        >
            <div>
                <span className="text-base text-text-300 select-none">{slice.content}</span>
            </div>
        </div>
    )
}

function SliceComponent({ idx, slice }: { idx: number; slice: StateEditorSlice[0] }) {
    const {
        mouseStates: {
            targetState: { setTarget },
            targetActionState: { setTargetAction }
        }
    } = useLocalState()

    const activateTarget = (index: number) => {
        setTarget(index)
        setTargetAction('moving')
    }

    if (slice.type === 'content') return <SliceContentComponent idx={idx} slice={slice} />
    else if (slice.type == 'space')
        return (
            <div className="h-32 max-w-[2px] -top-4 opacity-35 relative bg-primary-400 flex justify-center">
                <div
                    onMouseDown={() => activateTarget(slice.targetIndex ?? 0)}
                    className="flex items-center h-32 min-w-5 cursor-ew-resize"
                >
                    <div className="cursor-ew-resize flex items-end pb-1 fill-primary-400 absolute h-12">
                        <SpaceStepIcon width={20} height={12} className="stroke-primary-400" />
                    </div>
                </div>
            </div>
        )
    else
        return (
            <div className="h-32 max-w-[2px] -top-4 opacity-35 relative bg-primary-400 flex justify-center">
                <div
                    onMouseDown={() => activateTarget(slice.targetIndex ?? 0)}
                    className="flex items-center h-32 min-w-5 cursor-ew-resize"
                >
                    <div className="flex -left-[8px] items-end pb-1 absolute h-12">
                        <NoSpaceStepIcon width={24} height={14} className="stroke-primary-400" />
                    </div>
                </div>
            </div>
        )
}

function EditorMoveTimeDividers() {
    const dispatch = useAppDispatch()
    const {
        editor: {
            rootDiv,
            widthState: { width }
        },
        lineStates: {
            lineState: { line },
            durationState: { duration }
        },
        mouseStates: {
            targetState: { target, setTarget },
            targetActionState: { targetAction, setTargetAction }
        }
    } = useLocalState()
    useEffect(() => {
        const handleMove = (x: number) => {
            if (target == null) return

            document.body.style.setProperty('cursor', 'ew-resize', 'important')
            let item = { ...line[target] }
            const xr = x / width
            let time = xr * duration

            const left = line[target - 1]
            const right = line[target + 1]

            if (left && left.time + 100 >= time) time = left.time + 100
            if (right && right.time - 100 <= time) time = right.time - 100

            item['time'] = time
            dispatch(TimedLyricsAction.update({ index: target, content: item }))
        }

        const mousemoveHandler = (e: MouseEvent) => {
            if (targetAction == null) return
            let left = rootDiv.current?.getBoundingClientRect().left ?? 0
            const x = e.clientX
            let ox = x - left < 0 ? 0 : x - left
            handleMove(ox)
        }

        const mouseupHandler = (e: MouseEvent) => {
            document.body.style.removeProperty('cursor')
            setTarget(null)
            setTargetAction(null)
        }

        document.addEventListener('mousemove', mousemoveHandler)
        document.addEventListener('mouseup', mouseupHandler)

        return () => {
            document.removeEventListener('mousemove', mousemoveHandler)
            document.removeEventListener('mouseup', mouseupHandler)
        }
    })

    return <></>
}

function EditorUpdateWidth() {
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
        setWidth(w)
        const durationScaled = duration - (duration % detailTime) // properly scaled duration
        const details = extradetails * Math.floor(durationScaled / detailTime) + 1

        const gapsize = 5

        setFocusWidth(w < gapsize * details ? gapsize * details : w)
    }, [rootDiv, width, duration])

    return <></>
}

function EditorSlices() {
    const {
        editor: {
            slicesState: { slices }
        }
    } = useLocalState()

    return (
        <>
            {slices.map((slice, idx) => (
                <Fragment key={idx}>
                    <SliceComponent slice={slice} idx={idx} />
                </Fragment>
            ))}
        </>
    )
}

class SpacelessString {
    constructor(
        public offsetSpaceMap: Array<number>, // spacemap that fits spaceless text
        public spaceMap: Array<number>, // spacemap that fits original text
        public content: string,
        public length: number
    ) {}

    public toString() {
        let content = ''
        const charset = this.content.split('')

        for (let i = 0; i < charset.length; i++) {
            const it = this.offsetSpaceMap.findIndex((item) => item == i)

            if (it !== -1) {
                content += ' '
            }

            content += charset[i]
        }

        return content
    }

    public static from(text: string) {
        const spacemap = []
        const offsetspacemap = []
        const charset = text.split('')
        let content = ''

        let h = 0
        for (let i = 0; i < charset.length; i++) {
            const char = charset[i]
            if (char.trim() == '') {
                spacemap.push(i)
                offsetspacemap.push(i - h)
                h++
            } else content += char
        }

        return new SpacelessString(offsetspacemap, spacemap, content, charset.length)
    }

    public remapIndex(index: number): number {
        const spaces = this.spaceMap.filter((item) => index > item)
        return index - spaces.length
    }

    public chars() {
        return this.toString()
    }

    public slice(start: number, end?: number) {
        return SpacelessString.from(this.toString().slice(start, end))
    }
}

function EditorAddDividers() {
    const {
        activeLine,
        activeLyrics,
        lineStates: {
            lineState: { line }
        }
    } = useLocalState()

    const lyric = activeLyrics.find((item) => item[0] == activeLine)?.[1]!

    const slyric = SpacelessString.from(lyric)
    const oline = line.map((item) => {
        return {
            ...item,
            offset: slyric.remapIndex(item.offset)
        }
    })

    const hasLine = (idx: number) => {
        return oline.findIndex((item) => item.offset == idx) !== -1
    }
    const typeLine = (idx: number) => {
        return oline.find((item) => item.offset == idx)?.type
    }

    useEffect(() => {
        const of = line.map((item) => slyric.remapIndex(item.offset))
        console.log(of)
    }, [lyric, line, slyric])

    return (
        <div className="h-full w-full flex items-center justify-center">
            {slyric.content.split('').map((char, idx) => (
                <Fragment key={idx}>
                    <span
                        style={
                            {
                                // display: item.type == 'content' ? 'flex' : 'none'
                            }
                        }
                        className="text-text-200 text-xl select-none"
                    >
                        {char}
                    </span>
                    <div
                        style={{
                            // display: item.type !== 'content' ? 'flex' : 'none',
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

export default function TimedLyricEditor() {
    const {
        editor: {
            rootDiv,
            widthState: { width },
            focusWidthState: { focusWidth },
            detailTimeState: { detailTime },
            extradetailsState: { extradetails }
        },
        lineStates: {
            startState: { start },
            endState: { end }
        }
    } = useLocalState()

    const [checked, setChecked] = useState(false)

    return (
        <div
            ref={rootDiv}
            className="flex flex-col text-lg h-32 overflow-x-auto overflow-y-hidden w-full bg-background-800 bg-gradient-to-t from-background-900  to-95% to-background-950"
            style={{ minWidth: width == 0 ? '' : width + 'px' }}
        >
            <EditorUpdateSlices />
            <EditorMoveTimeDividers />
            <EditorUpdateWidth />

            <div className="flex min-h-8 bg-background-900 border-y-2 border-background-base w-full">
                <div className="h-full w-16 flex justify-center items-center">
                    <Switch
                        checked={checked}
                        onChange={(e) => setChecked(e.currentTarget.checked)}
                        color="gray"
                    />
                </div>
            </div>
            <div
                className="flex flex-col h-full overflow-hidden"
                style={{ width: focusWidth + 'px' }}
            >
                {checked ? (
                    <div className="h-[6rem] w-full">
                        <EditorAddDividers />
                    </div>
                ) : (
                    <>
                        <div className="flex h-6">
                            <FocusEditorViewTimelineDetails
                                start={start}
                                end={end}
                                width={focusWidth}
                                detailTime={detailTime}
                                edetails={extradetails}
                            />
                        </div>
                        <div className="z-10 flex items-center h-16">
                            <EditorSlices />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
