'use client'
import SliceComponent from './SliceComponent'
import { Fragment } from 'react'
import { useLocalState } from '../../LocalState'

export default function Component() {
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
