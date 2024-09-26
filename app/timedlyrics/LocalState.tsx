import { useAppSelector } from '@/lib/hooks'
import { TimedLinesState } from '@/lib/timedlines'
import {
    createContext,
    Dispatch,
    RefObject,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'
import { TimedLyricLineData } from '../cachedb/timedlyrics'
import { Session, SessionReference } from '../cachedb/sessions'

export type StateEditorSlice = Array<{
    type: 'content' | 'nospace' | 'space'
    width?: number
    content?: string
    targetIndex?: number
}>

export type State = {
    session: SessionReference | null
    activeLine: number | null
    timedlines: TimedLinesState
    activeLyrics: Array<[number, string]>
    lines: Record<number, TimedLyricLineData>
    editor: {
        rootDiv: RefObject<HTMLDivElement>
        slicesState: {
            slices: StateEditorSlice
            setSlices: Dispatch<SetStateAction<StateEditorSlice>>
        }
        widthState: {
            width: number
            setWidth: Dispatch<SetStateAction<number>>
        }
        focusWidthState: {
            focusWidth: number
            setFocusWidth: Dispatch<SetStateAction<number>>
        }
        detailTimeState: {
            detailTime: number
            setDetailTime: Dispatch<SetStateAction<number>>
        }
        extradetailsState: {
            extradetails: number
            setExtradetails: Dispatch<SetStateAction<number>>
        }
    }
    lineStates: {
        lineState: {
            line: TimedLyricLineData
            setLine: Dispatch<SetStateAction<TimedLyricLineData>>
        }
        startState: {
            start: number
            setStart: Dispatch<SetStateAction<number>>
        }
        endState: {
            end: number
            setEnd: Dispatch<SetStateAction<number>>
        }
        durationState: {
            duration: number
            setDuration: Dispatch<SetStateAction<number>>
        }
    }
    mouseStates: {
        targetState: { target: null | number; setTarget: Dispatch<SetStateAction<number | null>> }
        targetActionState: {
            targetAction: null | 'moving'
            setTargetAction: Dispatch<SetStateAction<null | 'moving'>>
        }
    }
}

const Context = createContext<State>({
    session: null,
    activeLine: null,
    timedlines: { primary: [], secondary: [] },
    activeLyrics: [],
    lines: {},
    editor: {
        rootDiv: null as any,
        slicesState: {
            slices: [],
            setSlices: () => {}
        },
        widthState: {
            width: 0,
            setWidth: () => {}
        },
        focusWidthState: {
            focusWidth: 0,
            setFocusWidth: () => {}
        },
        detailTimeState: {
            detailTime: 0,
            setDetailTime: () => {}
        },
        extradetailsState: {
            extradetails: 0,
            setExtradetails: () => {}
        }
    },
    lineStates: {
        lineState: {
            line: [],
            setLine: () => {}
        },
        startState: {
            start: 0,
            setStart: () => {}
        },
        endState: {
            end: 0,
            setEnd: () => {}
        },
        durationState: {
            duration: 0,
            setDuration: () => {}
        }
    },
    mouseStates: {
        targetState: { target: null, setTarget: () => {} },
        targetActionState: { targetAction: null, setTargetAction: () => {} }
    }
})

export function LocalStateProvider({ children }: { children: React.ReactNode }) {
    const activeSession = useAppSelector((state) => state.sessions.activeSession)
    const [session, setSession] = useState<SessionReference | null>(null)
    const activeLine = useAppSelector((state) => state.timedlyrics.activeLine)
    const timedlines = useAppSelector((state) => state.timedlines)
    const activeLyrics = useAppSelector((state) => state.lyrics.active)
    const lines = useAppSelector((state) => state.timedlyrics.lines)
    const [slices, setSlices] = useState<StateEditorSlice>([])
    const [width, setWidth] = useState(0)
    const [focusWidth, setFocusWidth] = useState(0)
    const [detailTime, setDetailTime] = useState(1000)
    const [extradetails, setExtradetails] = useState(16)
    const rootDiv = useRef<HTMLDivElement>(null)

    const [line, setLine] = useState<TimedLyricLineData>([])
    const [start, setStart] = useState(24 * 1000)
    const [end, setEnd] = useState(34 * 1000)
    const [duration, setDuration] = useState(end - start)

    const [target, setTarget] = useState<null | number>(null)
    const [targetAction, setTargetAction] = useState<null | 'moving'>(null)

    useEffect(() => {
        const fn = async () => {
            if (!activeSession) return
            const session = await Session.get(activeSession.uuid)
            setSession(session)
        }

        fn()
    }, [activeSession])

    useEffect(() => {
        const item = [...timedlines.primary, ...timedlines.secondary].find(
            (item) => item.linenumber == activeLine
        )
        if (!item) return

        setStart(item.start)
        setEnd(item.end)
        setDuration(item.end - item.start)
    }, [timedlines, activeLine])

    useEffect(() => {
        if (!activeLine) return

        const lineitem = lines[activeLine]
        setLine(lineitem ?? [])
    }, [lines, activeLine])

    return (
        <Context.Provider
            value={{
                session,
                activeLine,
                timedlines,
                activeLyrics,
                lines,
                editor: {
                    rootDiv: rootDiv,
                    slicesState: { slices, setSlices },
                    widthState: { width, setWidth },
                    focusWidthState: { focusWidth, setFocusWidth },
                    detailTimeState: {
                        detailTime,
                        setDetailTime
                    },
                    extradetailsState: {
                        extradetails,
                        setExtradetails
                    }
                },
                lineStates: {
                    lineState: { line, setLine },
                    startState: { start, setStart },
                    endState: { end, setEnd },
                    durationState: { duration, setDuration }
                },
                mouseStates: {
                    targetState: { target, setTarget },
                    targetActionState: { targetAction, setTargetAction }
                }
            }}
        >
            {children}
        </Context.Provider>
    )
}

export function useLocalState() {
    return useContext(Context)
}
