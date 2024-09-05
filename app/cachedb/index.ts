export const getDatabase = (name: string = 'database'): Promise<IDBDatabase> => {
    return new Promise((res, rej) => {
        const request: IDBOpenDBRequest = indexedDB.open('localdb', 1)

        request.onerror = (error) => console.error(error)
        request.onsuccess = (event) => res((event.target as IDBOpenDBRequest).result)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            db.createObjectStore('audio', { keyPath: 'id', autoIncrement: true })
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
