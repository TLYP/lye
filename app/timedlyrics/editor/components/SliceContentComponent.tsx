'use client'
import { StateEditorSlice } from '../../LocalState'

export default function Component({ idx, slice }: { idx: number; slice: StateEditorSlice[0] }) {
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
