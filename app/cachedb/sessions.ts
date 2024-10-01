import { getDatabase } from '.'
import { File, FileReference } from './file'
import { Lyric, LyricReference } from './lyrics'
import { TimedLines, TimedLinesReference } from './timedlines'
import { TimedLyric, TimedLyricReference } from './timedlyrics'

const TABLE_NAME = 'sessions'

export type SessionData = {
    uuid: string
    name: string
    fileRef: string
    lyricRef: string
    timedlinesRef: string
    timedlyricsRef: string
}

export type SessionDataRefs = {
    file: FileReference
    lyric: LyricReference
    timedlines: TimedLinesReference
    timedlyrics: TimedLyricReference
}

export class Session {
    constructor(public data: SessionData) {}

    public async save(db?: IDBDatabase) {
        if (!db) db = await getDatabase()
        await add(this.data, db)

        const file = await File.get(this.data.fileRef)
        const lyric = await Lyric.get(this.data.lyricRef)
        const timedlines = await TimedLines.get(this.data.timedlinesRef)
        const timedlyrics = await TimedLyric.get(this.data.timedlyricsRef)

        return new SessionReference(this.data, { file, lyric, timedlines, timedlyrics }, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = await get(uuid, db)
        return new SessionReference(
            data,
            {
                file: await File.get(data.fileRef, db),
                lyric: await Lyric.get(data.lyricRef, db),
                timedlines: await TimedLines.get(data.timedlinesRef, db),
                timedlyrics: await TimedLyric.get(data.timedlyricsRef, db)
            },
            db
        )
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const sessions = []

        for (const sessionItem of await getAll(db)) {
            sessions.push(await Session.get(sessionItem.uuid))
        }

        return sessions
    }

    public static from(data: Omit<SessionData, 'uuid'>) {
        const ldata = data as SessionData
        ldata['uuid'] = crypto.randomUUID()
        return new Session(ldata)
    }

    public static async getActiveSession() {
        const session = localStorage.getItem('session')
        if (session == null) return

        return Session.get(session)
    }

    public static setActiveSession(uuid: string) {
        localStorage.setItem('session', uuid)
    }
}

export class SessionReference {
    constructor(
        private data: SessionData,
        private refs: SessionDataRefs,
        private db: IDBDatabase
    ) {}

    public serialize() {
        return this.data
    }

    public get uuid() {
        return this.data['uuid']
    }

    public get file() {
        return this.refs['file']
    }

    public get lyric() {
        return this.refs['lyric']
    }

    public get timedlines() {
        return this.refs['timedlines']
    }

    public get timedlyrics() {
        return this.refs['timedlyrics']
    }

    public get name() {
        return this.data['name']
    }
}

export const add = async (data: SessionData, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

export const getAll = async (db: IDBDatabase): Promise<Array<SessionData>> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readonly')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request = objectStore.getAll()

        request.onerror = (error) => rej(error)
        request.onsuccess = () => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}

export const get = async (uuid: string, db: IDBDatabase): Promise<SessionData> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readonly')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request = objectStore.get(uuid)

        request.onerror = (error) => rej(error)
        request.onsuccess = () => {
            res(request.result)
        }
    })
}

const defs = { TABLE_NAME }
export default defs
