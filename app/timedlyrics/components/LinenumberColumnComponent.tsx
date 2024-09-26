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
            <div
                className="flex items-center justify-center p-2 px-4 h-[44px] w-full"
                style={{
                    height: linenumber === activeLine ? 172 + 'px' : '44px'
                }}
            >
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

            {/*
<div
                style={{ display: linenumber === activeLine ? 'flex' : 'none' }}
                className="flex-col h-32 z-30 w-full bg-background-base border-background-950 border-t-[2px]"
            >
                <div className="h-8 w-full"></div>
                <div className="w-full h-24">
                    <div className="w-full h-6 flex justify-center items-center cursor-pointer">
                        <PlayIcon className="w-5 h-5 fill-text-300" />
                    </div>
                </div>
            </div>
                */}
        </div>
    )
}
