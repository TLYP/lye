'use client'
import { Fragment } from 'react'
import { formattedMS } from '../timedlines/page'

export default function FocusEditorViewTimelineDetails({
    start,
    end,
    width,
    detailTime,
    edetails: extradetails
}: {
    start: number
    end: number
    width: number
    detailTime: number
    edetails: number
}) {
    const t = detailTime
    const duration = end - start
    const rstart = t - (start % t)
    const rend = end % t
    const fstart = start + rstart
    const ostart = width * (rstart / duration)
    const pduration = duration - (rstart + rend)
    const pwidth = width * (pduration / duration)
    const details = extradetails * (pduration / t)
    const pgap = pwidth / details
    const pdgap = pduration / details
    const startDetails = Math.ceil(ostart / pgap) + 1
    const endDetails = Math.ceil(ostart / pgap)

    const ItemWithTime = ({ left, ms }: { left: number; ms: number }) => (
        <div
            className="flex justify-center absolute min-w-[2px] h-0 bg-text-400 opacity-35"
            style={{
                left: left + 'px'
            }}
        >
            <div className="absolute min-w-[2px] h-2 bg-text-500 z-50 opacity-95"></div>
            <div className="-top-0.5 absolute min-w-[2px] h-2  z-50">
                <span className="text-xs text-text-400 select-none">{formattedMS(ms)}</span>
            </div>
            <div className="absolute min-w-[2px] min-h-24 bg-gradient-to-t from-background-900 to-95% to-background-800 opacity-50"></div>
        </div>
    )

    const ItemTallDivider = ({ left }: { left: number }) => (
        <div
            className="absolute flex min-w-[2px] h-0 opacity-50"
            style={{
                left: left + 'px'
            }}
        >
            <div className="absolute min-w-[2px] h-2 bg-text-600 opacity-50"></div>
        </div>
    )
    const ItemShortDivider = ({ left }: { left: number }) => (
        <div
            className="absolute flex min-w-[2px] h-0 opacity-40"
            style={{
                left: left + 'px'
            }}
        >
            <div className="absolute min-w-[2px] h-3 bg-text-700 z-50"></div>
        </div>
    )

    return (
        <div className="relative flex w-full">
            {Array.from({ length: startDetails }).map((_, i) => {
                const left = ostart - i * pgap

                let element: React.ReactNode

                if (i % extradetails === 0 && i !== 0) {
                    element = <ItemWithTime left={left} ms={1000} />
                } else if (i % 2 == 1) {
                    element = <ItemTallDivider left={left} />
                } else {
                    element = <ItemShortDivider left={left} />
                }

                return <Fragment key={i}>{element}</Fragment>
            })}

            {Array.from({ length: details + 1 }).map((_, i) => {
                const left = ostart + i * pgap
                return (
                    <Fragment key={i}>
                        {i % extradetails === 0 && (
                            <ItemWithTime left={left} ms={fstart + i * pdgap} />
                        )}

                        {i % extradetails !== 0 && i % 2 == 1 && <ItemTallDivider left={left} />}

                        {i % extradetails !== 0 && i % 2 != 1 && i % 2 == 0 && (
                            <ItemShortDivider left={left} />
                        )}
                    </Fragment>
                )
            })}

            {Array.from({ length: endDetails }).map((_, i) => {
                const left = ostart + pwidth + i * pgap

                let element: React.ReactNode

                if (i % extradetails === 0 && i !== 0) {
                    element = <ItemWithTime left={left} ms={1000} />
                } else if (i % 2 == 1) {
                    element = <ItemTallDivider left={left} />
                } else {
                    element = <ItemShortDivider left={left} />
                }

                return <Fragment key={i}>{element}</Fragment>
            })}
        </div>
    )
}
