import { getDatabase } from './index'

export const TABLE_NAME = 'files'

function base64toBlob(base64Data: string, contentType: string) {
    contentType = contentType || ''
    const sliceSize = 1024
    const byteCharacters = atob(base64Data)
    const bytesLength = byteCharacters.length
    const slicesCount = Math.ceil(bytesLength / sliceSize)
    const byteArrays = new Array(slicesCount)

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize
        const end = Math.min(begin + sliceSize, bytesLength)

        const bytes = new Array(end - begin)
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0)
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes)
    }
    return new Blob(byteArrays, { type: contentType })
}

export type FileCache = {
    uuid: string
    data: string
    filename: string
    filetype: string
    filesize: number
}

export class File {
    constructor(public data: FileCache) {}

    public async save(db?: IDBDatabase) {
        if (!db) db = await getDatabase()
        await add(this.data, db)

        return new FileReference(this.data, db)
    }

    // statics
    public static async get(uuid: string, db?: IDBDatabase) {
        if (!db) db = await getDatabase()

        const data = await get(uuid, db)
        return new FileReference(data, db)
    }

    public static from(data: Omit<FileCache, 'uuid'>) {
        const ldata = data as FileCache
        ldata['uuid'] = crypto.randomUUID()
        return new File(ldata)
    }
}

export class FileReference {
    constructor(
        private data: FileCache,
        private db: IDBDatabase
    ) {}

    public get dataURI() {
        const blob = base64toBlob(this.data['data'].split(',')[1], this.fileType)
        return URL.createObjectURL(blob)
    }

    public get uuid() {
        return this.data['uuid']
    }

    public get fileName() {
        return this.data['filename']
    }

    public get fileType() {
        return this.data['filetype']
    }

    public get fileSize() {
        return this.data['filesize']
    }
}

export const add = async (data: FileCache, db: IDBDatabase) => {
    return new Promise((res, rej) => {
        const transaction = db.transaction([TABLE_NAME], 'readwrite')
        const objectStore = transaction.objectStore(TABLE_NAME)

        const request: IDBRequest<IDBValidKey> = objectStore.add(data)

        request.onerror = (error) => rej(error)
        request.onsuccess = (event) => res(event)
    })
}

export const getAll = async (db: IDBDatabase): Promise<Array<FileCache>> => {
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

export const get = async (uuid: string, db: IDBDatabase): Promise<FileCache> => {
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

const defs = { TABLE_NAME }
export default defs
