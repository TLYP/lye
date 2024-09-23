import { getDatabase } from '.'

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
        await add(this.data, db)

        return new TimedLyricReference(this.data, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = await get(uuid, db)
        return new TimedLyricReference(data, db)
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const timedLyrics = []

        for (let lyricItem of await getAll(db)) {
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
    constructor(private data: TimedLyricData, private db: IDBDatabase) {}

    public serialize() {
        return this.data
    }

    public async update() {
        await put(this.data, this.db)
    }
}

export const add = async (data: TimedLyricData, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

// updates or adds
export const put = async (data: TimedLyricData, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request = objectStore.put(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            res(event)
        }
    })
}

export const getAll = async (db: IDBDatabase): Promise<Array<TimedLyricData>> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readonly')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request = objectStore.getAll()

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}

export const get = async (uuid: string, db: IDBDatabase): Promise<TimedLyricData> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readonly')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request = objectStore.get(uuid)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}

const defs = { TABLE_NAME }
export default defs
