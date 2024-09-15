import { getDatabase } from '.'

export const TABLE_NAME = 'timedlyrics'

export type TimedLinesLine = {
    start: number
    end: number
    uhash: number // unique hash
    chash: number // content hash
    lhash: number // line number hash
}

export type TimedLyricData = {
    uuid: string
    lines: Array<TimedLinesLine>
}

export class TimedLines {
    constructor(public data: TimedLyricData) {}

    public async save(db?: IDBDatabase) {
        if (!db) db = await getDatabase()
        await add(this.data, db)

        return new TimedLinesReference(this.data, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = await get(uuid, db)
        return new TimedLinesReference(data, db)
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const lyrics = []

        for (let lyricItem of await getAll(db)) {
            lyrics.push(await TimedLines.get(lyricItem.uuid))
        }

        return lyrics
    }

    public static from(data: Omit<TimedLyricData, 'uuid'>) {
        const ldata = data as TimedLyricData
        ldata['uuid'] = crypto.randomUUID()
        return new TimedLines(ldata)
    }
}

export class TimedLinesReference {
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

    public get lines(): TimedLinesReferenceLine[] {
        return this.data['lines'].map((data) => new TimedLinesReferenceLine(data))
    }

    public set lines(value: TimedLinesLine[]) {
        this.data['lines'] = value
    }

    public async update() {
        await put(this.data, this.db)
    }
}

export class TimedLinesReferenceLine {
    constructor(public data: TimedLinesLine) {}

    public get start(): number {
        return this.data['start']
    }

    public set start(value: number) {
        this.data['start'] = value
    }

    public get end(): number {
        return this.data['end']
    }

    public get hash(): { c: number; l: number; u: number } {
        return { c: this.data['chash'], l: this.data['lhash'], u: this.data['uhash'] }
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
