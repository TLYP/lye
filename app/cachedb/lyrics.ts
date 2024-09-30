import { getDatabase } from '.'
import { add, get, getAll, put } from './utils'
export const TABLE_NAME = 'lyrics'

export type LyricLine = {
    content: string
    uhash: number // unique hash
}

export type LyricData = {
    uuid: string
    lines: Array<LyricLine>
}

export class Lyric {
    constructor(public data: LyricData) {}

    public async save(db?: IDBDatabase) {
        if (!db) db = await getDatabase()
        await add(this.data, db, TABLE_NAME)

        return new LyricReference(this.data, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = (await get(uuid, db, TABLE_NAME)) as LyricData

        return new LyricReference(data, db)
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const lyrics = []

        for (const lyricItem of await getAll(db, TABLE_NAME)) {
            lyrics.push(await Lyric.get(lyricItem.uuid))
        }

        return lyrics
    }

    public static from(data: Omit<LyricData, 'uuid'>) {
        const ldata = data as LyricData
        ldata['uuid'] = crypto.randomUUID()
        return new Lyric(ldata)
    }
}

export class LyricReference {
    constructor(
        private data: LyricData,
        private db: IDBDatabase
    ) {}

    public serialize() {
        return this.data
    }

    public get uuid() {
        return this.data['uuid']
    }

    public get lines() {
        return this.data['lines']
    }

    public set lines(lines: LyricLine[]) {
        this.data['lines'] = lines
    }

    public async update() {
        await put(this.data, this.db, TABLE_NAME)
    }
}

const defs = { TABLE_NAME }
export default defs
