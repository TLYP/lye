'use client'
import NoSpaceStepIcon from '@/app/components/icons/NoSpaceSep'
import SpaceStepIcon from '@/app/components/icons/SpaceSep'
import SliceContentComponent from './SliceContentComponent'
import { useLocalState, StateEditorSlice } from '../../LocalState'

export default function Component({ idx, slice }: { idx: number; slice: StateEditorSlice[0] }) {
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
