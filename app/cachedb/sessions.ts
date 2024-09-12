export type SessionData = {
    uuid: string
    sourceRef: string
    metadataRef: string
    lyricsRef: string
    timedLinesRef: string
    timedLyricsRef: string
}

class Session {
    constructor(public data: SessionData) { }

    public get lyrics() {
        return 0
    }

    public static factory(data: Omit<SessionData, "uuid">) {
        const ldata = data as SessionData
        ldata['uuid'] = crypto.randomUUID()
        return

    }
}


export const add = async (data: Array<SessionData>, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['sessions'], 'readwrite')
        const objectStore = transaction.objectStore('sessions')

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

export const getAll = async (db: IDBDatabase): Promise<Array<SessionData>> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['sessions'], 'readonly')
        const objectStore = transaction.objectStore('sessions')

        const request = objectStore.getAll()

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}


export const get = async (uuid: string, db: IDBDatabase): Promise<Array<SessionData>> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['sessions'], 'readonly')
        const objectStore = transaction.objectStore('sessions')

        const request = objectStore.get(uuid)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            res(request.result)
        }
    })
}

