import { getDatabase } from '.'

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
        await add(this.data, db)

        return new LyricReference(this.data, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = await get(uuid, db)
        return new LyricReference(data, db)
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const lyrics = []

        for (const lyricItem of await getAll(db)) {
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
        await put(this.data, this.db)
    }
}

export const add = async (data: LyricData, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

// updates or adds
export const put = async (data: LyricData, db: IDBDatabase) => {
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

export const getAll = async (db: IDBDatabase): Promise<Array<LyricData>> => {
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

export const get = async (uuid: string, db: IDBDatabase): Promise<LyricData> => {
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
