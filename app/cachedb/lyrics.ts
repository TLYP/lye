export type LyricLine = {
    content: string
    uhash: number // unique hash
    chash: number // content hash 
    lhash: number // line number hash
}

export type LyricData = {
    uuid: string,
    lines: Array<LyricLine>
}

export const add = async (data: Array<LyricData>, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['lyrics'], 'readwrite')
        const objectStore = transaction.objectStore('lyrics')

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

export const getAll = async (db: IDBDatabase): Promise<Array<LyricData>> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['lyrics'], 'readonly')
        const objectStore = transaction.objectStore('lyrics')

        const request = objectStore.getAll()

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}


export const get = async (uuid: string, db: IDBDatabase): Promise<Array<LyricData>> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['lyrics'], 'readonly')
        const objectStore = transaction.objectStore('lyrics')

        const request = objectStore.get(uuid)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result)
        }
    })
}

