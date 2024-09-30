import { getDatabase } from '.'
import { add, get, getAll, put } from './utils'

export const TABLE_NAME = 'timedlyrics'

export type TimedLyricLineItemData = {
    offset: number
    type: 'nospace' | 'space'
    time: number
}

export type TimedLyricLineData = Array<TimedLyricLineItemData>

export type TimedLyricData = {
    uuid: string
    lines: Record<number, TimedLyricLineData> // u-hash mapped to timedlyrics line
}

export class TimedLyric {
    constructor(public data: TimedLyricData) {}

    public async save(db?: IDBDatabase) {
        if (!db) db = await getDatabase()
        await add(this.data, db, TABLE_NAME)

        return new TimedLyricReference(this.data, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = (await get(uuid, db, TABLE_NAME)) as TimedLyricData
        return new TimedLyricReference(data, db)
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const timedLyrics = []

        for (const lyricItem of await getAll(db, TABLE_NAME)) {
            timedLyrics.push(await TimedLyric.get(lyricItem.uuid))
        }

        return timedLyrics
    }

    public static from(data: Omit<TimedLyricData, 'uuid'>) {
        const ldata = data as TimedLyricData
        ldata['uuid'] = crypto.randomUUID()
        return new TimedLyric(ldata)
    }
}

export class TimedLyricReference {
    constructor(
        private data: TimedLyricData,
        private db: IDBDatabase
    ) {}

    public serialize() {
        return this.data
    }

    public get uuid() {
        return this.data['uuid']
    }

    public set lines(value: Record<number, TimedLyricLineData>) {
        this.data['lines'] = value
    }

    public get lines() {
        return this.data['lines']
    }

    public async update() {
        await put(this.data, this.db, TABLE_NAME)
    }
}

const defs = { TABLE_NAME }
export default defs
