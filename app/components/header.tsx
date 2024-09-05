'use client'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import FolderIcon from './icons/folder'
import SpotifyIcon from './icons/spotify'
import PlayIcon from './icons/play'
//import PauseIcon from './icons/pause'
import { notifications } from '@mantine/notifications'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../lib/store'
import { setMusicUrl } from '../../lib/localAudio'
import { addData, getData, getDatabase } from '../cachedb'
import ComboBox from './combobox'

function StageChip({ name, path }: { name: string; path: string }) {
    return (
        <a
            href={path}
            className="flex justify-center items-center w-28 h-8 bg-background-900  rounded-md"
        >
            <span className="text-text-500 text-sm font-bold">{name}</span>
        </a>
    )
}

function Music() {
    const dispatch = useDispatch()
    const musicUrl = useSelector((state: RootState) => state.localaudio.musicUrl)

    useEffect(() => {
        if (musicUrl) return

        getDatabase().then((db) =>
            getData(db)
                .then((data) => {
                    console.log(data.data)
                    dispatch(setMusicUrl(data.data))
                })
                .catch((err) => {})
        )
    }, [dispatch, musicUrl])

    const change = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        const file = files.pop()
        if (file == undefined) return

        const fileReader = new FileReader()

        const id = notifications.show({
            title: 'Loading music',
            message: 'loading music from local file',
            position: 'bottom-center',
            loading: true,
            autoClose: false,
            withCloseButton: false,
            color: 'primary.4',
            styles: {
                root: {
                    background: 'oklch(27.92% 0.054 286.90)'
                },
                title: {},
                description: {}
            }
        })

        fileReader.readAsDataURL(file!)

        fileReader.onload = async () => {
            notifications.update({
                id,
                title: 'loaded',
                message: 'data was loaded',
                autoClose: true,
                withCloseButton: true,
                loading: false
            })

            const data = fileReader.result as string

            const db = await getDatabase()
            await addData(
                { filename: file.name, filetype: file.type, filesize: file.size, data },
                db
            )

            dispatch(setMusicUrl(data))
        }
    }

    return (
        <div className="flex  justify-evenly items-center min-w-20 h-12 border-2 border-text-200">
            {musicUrl == null && (
                <>
                    <label className="fill-accent-800 opacity-50 hover:opacity-100 cursor-pointer transition">
                        <FolderIcon className="fill-accent-100" />
                        <input
                            type="file"
                            accept="audio/*"
                            style={{ display: 'none' }}
                            onChange={(e) => change(e)}
                        />
                    </label>
                    <div className="w-1 h-1 bg-background-700 rounded" />
                    <button className="opacity-50 hover:opacity-100 transition">
                        <SpotifyIcon />
                    </button>
                </>
            )}

            {musicUrl != null && (
                <div className="flex justify-center items-center min-w-20 h-12 border-2 border-text-200">
                    <label className="flex flex-col fill-accent-800 opacity-100 hover:opacity-100 cursor-pointer transition">
                        <FolderIcon className="fill-accent-100" />
                    </label>
                </div>
            )}
        </div>
    )
}

function Player() {
    const musicUrl = useSelector((state: RootState) => state.localaudio.musicUrl)

    if (!musicUrl) return

    return (
        <div className="flex w-full">
            <div className="flex justify-center items-center min-w-12 h-12 cursor-pointer">
                <PlayIcon className="fill-accent-100" />
            </div>

            <div className="flex flex-col min-w-[500px] h-12 ">
                <div className="flex items-end min-w-full h-6 ">
                    <span className="text-text-100">
                        In Hell We Live, Lament - Let&#39;s Lament
                    </span>
                </div>
                <div className="flex items-center w-full h-6 cursor-pointer ">
                    <div className="flex items-center w-full h-4 ">
                        <div className="w-full h-1 bg-primary-700">
                            <div className="w-5/6 h-1 bg-secondary-300 "></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Header() {
    return (
        <div className="flex bg-background-base border-b-2 border-background-900">
            <div className="flex items-center min-w-48 h-12 px-4">
                <div className="w-full">
                    <ComboBox />
                </div>
            </div>
            <div className="flex w-full h-12">
                <Music />
                <Player />
            </div>
            <div className="flex items-center gap-6 h-12 px-16 ">
                <StageChip path="/metadata" name="Metadata" />
                <StageChip path="/lyrics" name="Add Lyrics" />
                <StageChip path="/timedlines" name="Timed Lines" />
                <StageChip path="/timedlyrics" name="Timed Lyrics" />
            </div>
        </div>
    )
}
