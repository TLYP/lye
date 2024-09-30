import { getDatabase } from '.'
import { File, FileReference } from './file'
import { Lyric, LyricReference } from './lyrics'
import { TimedLines, TimedLinesReference } from './timedlines'
import { TimedLyric, TimedLyricReference } from './timedlyrics'
import { add, get, getAll } from './utils'

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
        await add(this.data, db, TABLE_NAME)

        const file = await File.get(this.data.fileRef)
        const lyric = await Lyric.get(this.data.lyricRef)
        const timedlines = await TimedLines.get(this.data.timedlinesRef)
        const timedlyrics = await TimedLyric.get(this.data.timedlyricsRef)

        return new SessionReference(this.data, { file, lyric, timedlines, timedlyrics }, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = (await get(uuid, db, TABLE_NAME)) as SessionData
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

        for (const sessionItem of await getAll(db, TABLE_NAME)) {
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

const defs = { TABLE_NAME }
export default defs
