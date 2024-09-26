'use client'
import EditorUpdateSlices from './components/EditorUpdateSlices'
import EditorMoveTimeDividers from './components/EditorMoveTimeDividers'
import EditorUpdateWidth from './components/EditorUpdateWidth'
import EditorSlices from './components/EditorSlices'
import EditorAddDividers from './components/EditorAddDividers'
import PlayIcon from '@/app/components/icons/play'
import PauseIcon from '@/app/components/icons/pause'
import FocusEditorViewTimelineDetails from '../TimelineDetailsComponent'
import * as AudioPlayerActions from '@/lib/audioplayer'
import { Switch } from '@mantine/core'
import { useLocalState } from '../LocalState'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useState } from 'react'

export default function TimedLyricEditor() {
    const dispatch = useAppDispatch()
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
            endState: { end },
            durationState: { duration }
        }
    } = useLocalState()
    const paused = useAppSelector((state) => state.audioPlayer.audio?.paused ?? true)
    const currentTime = useAppSelector((state) => state.audioPlayer.audio?.currentTime ?? 0)

    const [checked, setChecked] = useState(false)

    return (
        <div
            ref={rootDiv}
            className="flex flex-col text-lg h-32 overflow-x-auto overflow-y-hidden w-full bg-background-800 bg-gradient-to-t from-background-900  to-95% to-background-950"
            style={{
                minWidth: width == 0 ? '' : width + 'px',
                maxWidth: width == 0 ? '' : width + 'px'
            }}
        >
            <EditorUpdateSlices />
            <EditorMoveTimeDividers />
            <EditorUpdateWidth />

            <div className="flex min-h-8 bg-background-900 border-y-2 border-background-base w-full">
                <div
                    className="flex items-center justify-center h-full py-1 w-12 cursor-pointer"
                    onClick={() => {
                        if (paused) {
                            dispatch(AudioPlayerActions.play())
                            dispatch(AudioPlayerActions.setCurrentTime(Math.floor(start / 1000)))
                        } else dispatch(AudioPlayerActions.pause())
                    }}
                >
                    {paused ? (
                        <PlayIcon className="stroke-text-300" />
                    ) : (
                        <PauseIcon className="stroke-text-300" />
                    )}
                </div>
                <div className="h-full w-16 flex justify-center items-center">
                    <Switch
                        checked={checked}
                        onChange={(e) => {
                            setChecked(e.currentTarget.checked)
                            dispatch(AudioPlayerActions.pause())
                        }}
                        color="gray"
                    />
                </div>
            </div>
            <div
                className="flex flex-col h-full overflow-hidden relative"
                style={{ width: focusWidth + 'px' }}
            >
                <div
                    className="absolute h-full w-[3px] bg-text-500"
                    style={{
                        display:
                            currentTime > start / 1000 && currentTime < end / 1000
                                ? 'flex'
                                : 'none',
                        left: ((currentTime - start / 1000) / (duration / 1000)) * focusWidth + 'px'
                    }}
                ></div>

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
