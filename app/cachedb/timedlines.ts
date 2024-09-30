import { getDatabase } from '.'
import { add, get, getAll, put } from './utils'

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
        await add(this.data, db, TABLE_NAME)

        return new TimedLinesReference(this.data, db)
    }

    // statics

    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = (await get(uuid, db, TABLE_NAME)) as TimedLineData
        return new TimedLinesReference(data, db)
    }

    public static async getAll(db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const lyrics = []

        for (const lyricItem of await getAll(db, TABLE_NAME)) {
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
        await put(this.data, this.db, TABLE_NAME)
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

const defs = { TABLE_NAME }
export default defs
