export class SpacelessString {
    constructor(
        public offsetSpaceMap: Array<number>, // spacemap that fits spaceless text
        public spaceMap: Array<number>, // spacemap that fits original text
        public content: string,
        public length: number
    ) {}

    public toString() {
        let content = ''
        const charset = this.content.split('')

        for (let i = 0; i < charset.length; i++) {
            const it = this.offsetSpaceMap.findIndex((item) => item == i)

            if (it !== -1) {
                content += ' '
            }

            content += charset[i]
        }

        return content
    }

    public static from(text: string) {
        const spacemap = []
        const offsetspacemap = []
        const charset = text.split('')
        let content = ''

        let h = 0
        for (let i = 0; i < charset.length; i++) {
            const char = charset[i]
            if (char.trim() == '') {
                spacemap.push(i)
                offsetspacemap.push(i - h)
                h++
            } else content += char
        }

        return new SpacelessString(offsetspacemap, spacemap, content, charset.length)
    }

    public remapIndex(index: number): number {
        const spaces = this.spaceMap.filter((item) => index > item)
        return index - spaces.length
    }

    public antiremapIndex(index: number): number {
        const spaces = this.spaceMap.filter((item) => index >= item)
        return index + spaces.length
    }

    public chars() {
        return this.toString()
    }

    public slice(start: number, end?: number) {
        return SpacelessString.from(this.toString().slice(start, end))
    }

    public spacelessSlice(start: number, end?: number) {
        const scontent = this.content.slice(start, end)
        let offsetspacemap = this.offsetSpaceMap.filter((item) => item >= start)
        if (end !== undefined) offsetspacemap = offsetspacemap.filter((item) => item <= end)
        let content = ''

        offsetspacemap = offsetspacemap.map((item) => item - start)

        let v = 0
        for (let i = 0; i < offsetspacemap.length; i++) {
            const h = offsetspacemap[i]
            content += scontent.slice(v, h) + ' '
            v = h
        }

        content += scontent.slice(v)

        return SpacelessString.from(content)
    }
}
