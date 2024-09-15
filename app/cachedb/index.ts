import Files from './file'
import Lyrics from './lyrics'
import Sessions from './sessions'
import TimedLines from './timedlines'

// fast hashing function
export const cyrb53 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)

    return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export const getDatabase = (name: string = 'database'): Promise<IDBDatabase> => {
    return new Promise((res, rej) => {
        const request: IDBOpenDBRequest = indexedDB.open('localdb', 1)

        request.onerror = (error) => console.error(error)
        request.onsuccess = (event) => res((event.target as IDBOpenDBRequest).result)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            db.createObjectStore(Files.TABLE_NAME, { keyPath: 'uuid' })
            db.createObjectStore(Lyrics.TABLE_NAME, { keyPath: 'uuid' })
            db.createObjectStore(Sessions.TABLE_NAME, { keyPath: 'uuid' })
            db.createObjectStore(TimedLines.TABLE_NAME, { keyPath: 'uuid' })
            db.createObjectStore('metadatas', { keyPath: 'uuid' })
        }
    })
}

export const addData = async (data: any, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['audio'], 'readwrite')
        const objectStore = transaction.objectStore('audio')

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

export const getData = async (db: IDBDatabase): Promise<any> => {
    return new Promise((res, rej) => {
        const transaction = db.transaction(['audio'], 'readonly')
        const objectStore = transaction.objectStore('audio')

        const request = objectStore.getAll()

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => {
            if (request.result.length == 0) rej(new Error())
            else res(request.result[0])
        }
    })
}
