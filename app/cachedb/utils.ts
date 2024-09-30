import { FileCache } from './file'
import { LyricData } from './lyrics'
import { SessionData } from './sessions'
import { TimedLineData } from './timedlines'
import { TimedLyricData } from './timedlyrics'

export const add = async (
    data: SessionData | LyricData | TimedLineData | TimedLyricData | FileCache,
    db: IDBDatabase,
    TableName: string
) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TableName], 'readwrite')
        const objectStore = transaction.objectStore(TableName)

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

export const put = async (
    data: TimedLyricData | TimedLineData | LyricData,
    db: IDBDatabase,
    TABLE_NAME: string
) => {
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

export const getAll = async (
    db: IDBDatabase,
    TABLE_NAME: string
): Promise<Array<TimedLyricData | TimedLineData | LyricData | SessionData | FileCache>> => {
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

export const get = async (
    uuid: string,
    db: IDBDatabase,
    TABLE_NAME: string
): Promise<TimedLyricData | TimedLineData | LyricData | SessionData | FileCache | LyricData> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readonly')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request = objectStore.get(uuid)

        request.onerror = (error) => rej(error)
        request.onsuccess = () => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}
