import {
    AspectRatio,
    Box,
    Button,
    Card,
    FileInput,
    Group,
    Image,
    Modal,
    rem,
    Text,
    SimpleGrid,
    Stack,
    Stepper,
    Overlay,
    TextInput,
    Loader,
    Paper
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconFile } from '@tabler/icons-react'
import { SetStateAction, Dispatch, useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Song } from '@/app/api/identify/route'
import PlayIcon from '@/app/components/icons/play'
import PauseIcon from '@/app/components/icons/pause'

function MusicCard({ song, onClick }: { song: Song; onClick: (song: Song) => void }) {
    return (
        <button
            onClick={() => onClick(song)}
        >
            <Card
                w={180}
                shadow="sm"
                radius="sm"
                withBorder
                className="select-none  opacity-65 hover:opacity-100 cursor-pointer active:scale-95 transition"
                itemType='button'
            >
                <Card.Section>
                    <AspectRatio ratio={1 / 1}>
                        <Box pos={'relative'}>
                            <Overlay backgroundOpacity={0} />
                            <Image
                                src={song.album.images[0].url}
                                alt="img.png"
                                className="pointer-events-none"
                            />
                        </Box>
                    </AspectRatio>
                </Card.Section>
                <Group justify="space-between" mt="sm">
                    <Text fw={500}>{song.name}</Text>
                </Group>
            </Card>

        </button>
    )
}

function InputFile({
    setTracks,
    setQuery,
    setData,
    setFile,
    setFileLoading,
    setNextStep,
    setAbortFn,
    fileLoading,
    file
}: {
    file: File | null
    fileLoading: boolean
    setAbortFn: Dispatch<SetStateAction<() => void>>
    setFileLoading: Dispatch<SetStateAction<boolean>>
    setTracks: Dispatch<SetStateAction<Song[] | null>>
    setQuery: Dispatch<SetStateAction<string>>
    setData: Dispatch<SetStateAction<string | null>>
    setFile: Dispatch<SetStateAction<File | null>>
    setNextStep: () => void
}) {
    return (
        <FileInput
            className="flex-grow"
            label="File"
            description="load a music file"
            placeholder="Select an .mp3 file"
            value={file}
            disabled={fileLoading}
            clearable
            onChange={(file) => {
                setFileLoading(true)
                setFile(file)

                if (file == null) {
                    setFileLoading(false)
                    setData(null)
                    return
                }

                const reader = new FileReader()

                reader.readAsDataURL(file)

                reader.onload = async (e) => {
                    const controller = new AbortController()

                    setAbortFn(() => {
                        return () => controller.abort()
                    })

                    axios
                        .post('/api/identify', reader.result, {
                            signal: controller.signal
                        })
                        .then((req) => {
                            const data: { code: number; query: string; tracks: Song[] } = req.data
                            setQuery(data.query)
                            setTracks(data.tracks)
                        })

                        .catch((err) => {
                            if (axios.isCancel(err)) {
                                setQuery('')
                                setTracks(null)
                            }
                        })
                        .finally(() => {
                            setFileLoading(false)
                            setNextStep()
                        })
                }
            }}
            accept="audio/mpeg"
            rightSection={fileLoading && <Loader size={'xs'} />}
            leftSection={<IconFile width={rem(14)} height={rem(14)} />}
        />
    )
}

function IdentifyMusic({
    setQuery,
    setTracks,
    nextStep,
    setSelectedTrack,
    query,
    tracks
}: {
    query: string
    tracks: Song[] | null
    nextStep: () => void
    setQuery: Dispatch<SetStateAction<string>>
    setTracks: Dispatch<SetStateAction<Song[] | null>>,
    setSelectedTrack: Dispatch<SetStateAction<Song | null>>
}) {
    const search = () => {
        axios
            .get('/api/spotify?query=' + encodeURIComponent(query), {})
            .then((req) => {
                const data: { code: number; query: string; tracks: Song[] } = req.data
                console.log(data.tracks)

                setTracks(data.tracks)
            })

            .catch((err) => { })
    }

    return (
        <Stack gap={12}>
            <Group>
                <TextInput
                    placeholder="search query"
                    className="flex-grow"
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    onKeyUp={(e) => (e.key == 'Enter' ? search() : null)}
                />

                <Button onClick={search}>Search</Button>
            </Group>
            <Group>
                {tracks == null && (
                    <Group className="w-full" justify="center">
                        <Paper p="xl">
                            <Text>Search for the metadata</Text>
                        </Paper>
                    </Group>
                )}

                {tracks?.length == 0 && (
                    <Group justify="center">
                        <Text>No results found from your query</Text>
                    </Group>
                )}

                <SimpleGrid
                    className="justify-between"
                    styles={{
                        root: {
                            width: '100%'
                        }
                    }}
                    cols={3}
                    spacing={'sm'}
                >
                    {tracks &&
                        tracks.map((track) => (
                            <MusicCard
                                key={track.id}
                                song={track}
                                onClick={(song) => {
                                    setSelectedTrack(song)
                                    nextStep()
                                }}
                            />
                        ))}
                </SimpleGrid>
            </Group>
        </Stack>
    )
}

export function ReviewMusic({ song }: { song: Song }) {
    const [previewLoaded, setPrevieeLoaded] = useState(false)
    const [paused, { toggle: togglePaused, close: setPlay, open: setPause }] = useDisclosure(true)
    const [audio, setAudio] = useState<HTMLAudioElement>()

    useEffect(() => {
        let audio = new Audio()
        audio.src = song.preview_url

        audio.onloadeddata = () => {

        }

        audio.onpause = () => {
            setPause();
        }

        setAudio(audio)
    }, [])

    const togglePlayPreview = () => {
        if (audio?.paused) {
            audio!.currentTime = 0
            audio?.play()
            setPlay()
        }
        else {
            audio?.pause()
            setPause()
        }
    }

    return <div className='flex gap-4'>
        <div className='w-44 h-44 relative'>
            <div>
                <img src={song?.album.images[0].url} />
            </div>
            <div className='flex justify-end items-end absolute top-0 left-0 w-44 h-44 p-1'>
                <div className='rounded-full p-3 fill-text-100 cursor-pointer' onClick={togglePlayPreview}>
                    {
                        paused ? <PlayIcon /> : <PauseIcon />
                    }

                </div>
            </div>
        </div>
        <div className='flex flex-col gap-1'>
            <div>
                <span className='text-lg text-text-100'>
                    {song.name}
                </span>
            </div>
            <div>
                <span className='text-base text-text-200'>
                    {song.album.name}
                </span>
            </div>
            <div>
                {song.artists.map((artist, idx) => <span className='text-base text-text-200' key={idx}>{artist.name}{song.artists.length - 1 != idx ? ', ' : ''}</span>)}
            </div>
        </div>

    </div>
}

export default function Component({ close, opened }: { close: () => void; opened: boolean }) {
    const [active, setActive] = useState(0)
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current))
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

    const [tracks, setTracks] = useState<Song[] | null>(null)
    const [selectedTrack, setSelectedTrack] = useState<Song | null>(null)
    const [query, setQuery] = useState<string>('')

    const [file, setFile] = useState<File | null>(null)
    const [fileLoading, setFileLoading] = useState<boolean>(false)
    const [_, setData] = useState<string | null>(null)
    const [abortFn, setAbortFn] = useState<() => void>(() => { })

    const handleFinalAdd = () => {
        close()
        setTracks(null)
        setQuery("")
        setData(null)
        setActive(0)
        setFile(null)
        setSelectedTrack(null)
    }

    return (
        <Modal opened={opened} onClose={close} title="Load local music" size="auto">
            <Stepper active={active}>
                <Stepper.Step label="Add music file">
                    <div className="flex flex-col gap-4">
                        <InputFile
                            setFileLoading={setFileLoading}
                            setTracks={setTracks}
                            setQuery={setQuery}
                            setFile={setFile}
                            setData={setData}
                            setNextStep={nextStep}
                            setAbortFn={setAbortFn}
                            file={file}
                            fileLoading={fileLoading}
                        />

                        <div
                            className="justify-end gap-4"
                            style={{ display: file ? 'flex' : 'none' }}
                        >
                            <Button
                                color="red"
                                style={{ display: fileLoading ? 'flex' : 'none' }}
                                onClick={() => {
                                    console.log('abort')
                                    abortFn()
                                }}
                            >
                                Contiue
                            </Button>
                            <Button disabled={fileLoading} onClick={nextStep}>
                                Next
                            </Button>
                        </div>
                    </div>
                </Stepper.Step>
                <Stepper.Step label="Identify music">
                    <div className="flex flex-col gap-4">
                        <IdentifyMusic
                            setTracks={setTracks}
                            setQuery={setQuery}
                            nextStep={nextStep}
                            setSelectedTrack={setSelectedTrack}
                            tracks={tracks}
                            query={query}
                        />

                        <div className="flex ">
                            <Button onClick={prevStep}>Previous</Button>
                        </div>
                    </div>
                </Stepper.Step>
                <Stepper.Step label="Review music">
                    <div className="flex flex-col gap-4">
                        <div>
                            <ReviewMusic song={selectedTrack!} />
                        </div>

                        <div
                            className="justify-between gap-4"
                            style={{ display: file ? 'flex' : 'none' }}
                        >
                            <Button onClick={prevStep}>
                                Previous
                            </Button>
                            <Button disabled={fileLoading} onClick={handleFinalAdd}>
                                Add
                            </Button>
                        </div>
                    </div>
                </Stepper.Step>
            </Stepper>
        </Modal>
    )
}
