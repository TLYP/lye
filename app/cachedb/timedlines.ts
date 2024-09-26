import { getDatabase } from '.'

export const TABLE_NAME = 'timedlines'

export const TimelineTarget = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary'
} as const

export type TimelineTarget = (typeof TimelineTarget)[keyof typeof TimelineTarget]
export type TimedLinesLine = {
    start: number
    end: number
    uhash: number // unique hash
    linenumber: number
    displayLineNumber: number
}

export type TimedLineData = {
    uuid: string
    timelines: {
        primary: TimedLinesLine[]
        secondary: TimedLinesLine[]
    }
}

export class TimedLines {
    constructor(public data: TimedLineData) {}

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

        for (const lyricItem of await getAll(db)) {
            lyrics.push(await TimedLines.get(lyricItem.uuid))
        }

        return lyrics
    }

    public static from(data: Omit<TimedLineData, 'uuid'>) {
        const ldata = data as TimedLineData
        ldata['uuid'] = crypto.randomUUID()
        return new TimedLines(ldata)
    }
}

export class TimedLinesReference {
    constructor(
        private data: TimedLineData,
        private db: IDBDatabase
    ) {}

    public serialize() {
        return this.data
    }

    public get uuid() {
        return this.data['uuid']
    }

    public get primary() {
        return new TimedLinesReferenceTimeline(this.data['timelines'], 'primary')
    }

    public get secondary() {
        return new TimedLinesReferenceTimeline(this.data['timelines'], 'secondary')
    }

    public async update() {
        await put(this.data, this.db)
    }
}

export class TimedLinesReferenceTimeline {
    constructor(
        public data: TimedLineData['timelines'],
        private target: TimelineTarget
    ) {}

    public addLine(line: TimedLinesLine) {
        this.data[this.target].push(line)
    }

    public get lines(): Array<TimedLinesReferenceLine> {
        return this.data[this.target].map((item) => new TimedLinesReferenceLine(item))
    }

    public set lines(nlines) {
        this.data[this.target] = nlines.map((item) => item.data)
    }

    public set(uhash: number, item: TimedLinesLine) {
        const index = this.data[this.target].findIndex((it) => it.uhash === uhash)
        if (index == -1) return

        this.data[this.target][index] = item
    }
}

export class TimedLinesReferenceLine {
    constructor(public data: TimedLinesLine) {}

    public set(value: TimedLinesLine) {
        this.data['start'] = value['start']
        this.data['end'] = value['end']
        this.data['linenumber'] = value['linenumber']
        this.data['displayLineNumber'] = value['displayLineNumber']
        this.data['uhash'] = value['uhash']
    }

    public get start(): number {
        return this.data['start']
    }

    public set start(value: number) {
        this.data['start'] = value
    }

    public get end(): number {
        return this.data['end']
    }

    public set end(value: number) {
        this.data['end'] = value
    }

    public get uhash(): number {
        return this.data['uhash']
    }

    public set uhash(value: number) {
        this.data['uhash'] = value
    }
}

export const add = async (data: TimedLineData, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

// updates or adds
export const put = async (data: TimedLineData, db: IDBDatabase) => {
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

export const getAll = async (db: IDBDatabase): Promise<Array<TimedLineData>> => {
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

export const get = async (uuid: string, db: IDBDatabase): Promise<TimedLineData> => {
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
