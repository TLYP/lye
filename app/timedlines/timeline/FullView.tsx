import { useEffect, useRef, useState } from 'react'
import { formattedMS } from '../page'
import { useAppSelector } from '@/lib/hooks'

function FocusEditorViewTimelineDetails({
    duration,
    divwidth,
    detailTime
}: {
    duration: number
    divwidth: number
    detailTime: number
}) {
    const details = Math.floor(duration / detailTime)

    return (
        <div className="relative flex w-full">
            {Array.from({
                length: details
            }).map((_, i) => (
                <div key={i}>
                    {i % 16 == 0 ? (
                        <div
                            className="flex justify-center absolute min-w-[2px] h-0 bg-text-400 opacity-55"
                            style={{
                                left: (1 + i) * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-1 bg-text-400 z-50 opacity-95"></div>
                            <div className="-top-0.5 absolute min-w-[2px] h-2  z-50 ">
                                <span className="text-xs text-text-400 select-none">
                                    {formattedMS((1 + i) * detailTime)}
                                </span>
                            </div>
                            <div className="absolute min-w-[1px] h-16 bg-text-800 opacity-55"></div>
                        </div>
                    ) : i % 2 !== 0 ? (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: (1 + i) * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-2 bg-text-700 opacity-20"></div>
                        </div>
                    ) : (
                        <div
                            className="absolute flex min-w-[2px] h-0 opacity-40"
                            style={{
                                left: (1 + i) * (divwidth / details) - 0.5 + 'px'
                            }}
                        >
                            <div className="absolute min-w-[2px] h-3 bg-text-800 z-50"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default function FullView() {
    const rootDiv = useRef<HTMLDivElement>(null)
    const duration = useAppSelector((state) =>
        Math.floor((state.audioPlayer.audio?.duration ?? 0) * 1000)
    )

    const timedlines = useAppSelector((state) => state.timedlines)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (!rootDiv.current) return
        setWidth(rootDiv.current.getBoundingClientRect().width)
    }, [rootDiv])

    useEffect(() => {
        const handleResize = () => {
            if (!rootDiv.current) return
            setWidth(rootDiv.current.getBoundingClientRect().width)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

    return (
        <div
            className="flex flex-col min-h-15  bg-background-800 bg-gradient-to-b from-background-900  to-95% to-background-950 border-b-background-900 border-t-background-950 border-y-2"
            ref={rootDiv}
        >
            <div className="flex justify-between h-5 w-full">
                <FocusEditorViewTimelineDetails
                    duration={duration}
                    divwidth={width}
                    detailTime={1000}
                />
            </div>

            <div className="flex w-full h-5 relative">
                {timedlines.primary.map((item, i) => (
                    <div
                        key={i}
                        className="border-text-800 border-[1px] absolute rounded-sm flex justify-center items-center bg-background-800 h-4"
                        style={{
                            width: ((item.end - item.start) / duration) * width + 'px',
                            left: (item.start / duration) * width + 'px'
                        }}
                    >
                        <div className="flex justify-center grow-[1]">
                            <span className="text-xs text-text-400 select-none">
                                {item.displayLineNumber}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex w-full h-5 relative">
                {timedlines.secondary.map((item, i) => (
                    <div
                        key={i}
                        className="border-text-800 border-[1px] absolute rounded-sm flex justify-center items-center bg-background-800 h-4"
                        style={{
                            width: ((item.end - item.start) / duration) * width + 'px',
                            left: (item.start / duration) * width + 'px'
                        }}
                    >
                        <div className="flex justify-center grow-[1]">
                            <span className="text-xs text-text-400 select-none">
                                {item.displayLineNumber}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
