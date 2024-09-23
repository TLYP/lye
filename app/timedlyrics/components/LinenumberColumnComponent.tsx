'use client'
import { useAppSelector } from '@/lib/hooks'

export default function Component({
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
