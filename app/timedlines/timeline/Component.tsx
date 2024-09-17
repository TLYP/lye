import FocusEditorView from './FocusEditorView'
import { Dispatch, SetStateAction } from 'react'
import { Slider } from '@mantine/core'

function ToolsView({ setZoomSize }: { setZoomSize: Dispatch<SetStateAction<number>> }) {
    return (
        <div className="flex justifycenter w-full h-6">
            <div className="flex w-96 h-6 grow-[1]">
                <div className="flex items-center">
                    <div className="w-44">
                        <Slider
                            onChange={setZoomSize}
                            defaultValue={1}
                            min={0.15}
                            step={0.01}
                            max={3}
                            size="xs"
                            label={null}
                            color="grey"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-center w-72 h-6 grow-[1]"></div>
        </div>
    )
}

export default function Component({
    setTimedlines,
    setZoomSize,
    timedlines,
    detailTime,
    zoomSize
}: {
    timedlines: any[]
    detailTime: number
    zoomSize: number
    setZoomSize: Dispatch<SetStateAction<number>>
    setTimedlines: Dispatch<SetStateAction<any[]>>
}) {
    return (
        <div className="flex fixed bottom-0 w-screen h-44 overflow-hidden bg-background-900">
            <div className="min-w-16 h-full bg-text-950"></div>
            <div className="flex flex-col w-[calc(100%-4rem)]">
                <ToolsView setZoomSize={setZoomSize} />
                <div className="grow-[1] h-14 bg-background-900">full view</div>
                <FocusEditorView
                    setTimedlines={setTimedlines}
                    timedlines={timedlines}
                    detailTime={detailTime}
                    zoomSize={zoomSize}
                />
            </div>
        </div>
    )
}
