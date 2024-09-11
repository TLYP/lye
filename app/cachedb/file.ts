export type FileCache = {
    id: string
    data: string
    filename: string
    filetype: string
    filesize: string
}

export const addData = async (data: FileCache, db: IDBDatabase) => {
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
