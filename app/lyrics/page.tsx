'use client'
import { Button, Textarea } from '@mantine/core'
import { useRef, useState } from 'react'
import { cyrb53 } from '../cachedb/index'
import { diffChars, diffArrays, diffLines } from 'diff'

function lineChanges(lines: { content: string, type: 'created' | 'deleted' | 'updated' }[]) {
    // console.log(JSON.stringify(lines, null, 4))
}

export default function Page() {
    const [mapped, setMapped] = useState(['', ''])
    const [prevalue, _] = useState(`I walked down a path
Leading to the past
Stole from the tree's hands
A regretter's friend, the forbidden fruit
I bite off the skin
Chewing on its tender flesh
Quaff down its lukewarm pus
You've became the "Me" who you despised
We've swallowed the time, let us rewind
Lament!
If you wanted me to speak
If you wanted me to think
If you wanted me to carry on our dreams
Each loop we live through (each loop we live through)
The standards inside me
The line I drew for me
Lowers to the earth`)
    const [value, setValue] = useState(`I walked down a path
Leading to the past
Stole from the tree's hands
A regretter's friend, the forbidden fruit
I bite off the skin
Chewing on its tender flesh
Quaff down its lukewarm pus
You've became the "Me" who you despised
We've swallowed the time, let us rewind
Lament!
If you wanted me to speak
If you wanted me to think
If you wanted me to carry on our dreams
Each loop we live through (each loop we live through)
The standards inside me
The line I drew for me
Lowers to the earth`)
    const textarea = useRef<HTMLTextAreaElement>()
    const onchange = (e: any) => {
        const text = textarea!.current!.value
        setValue(text)
        const content = text.split('\n').map(t => t.trim()).join('\n')

        const valuearr = prevalue.split('\n')
        const contentarr = content.split('\n')

        const diffs = diffArrays(valuearr, contentarr)
        let linenum = 1
        let lineoffset = 0

        const updates: any[] = []
        console.log(JSON.stringify(diffs, null, 4))

        for (let i = 0; i < diffs.length; i++) {
            const diff = diffs[i]

            if (diff.removed) {
                lineoffset += diff.value.length
                continue
            }

            if (diff.added) {
                lineoffset -= diff.count!

                for (let j = 0; j < diff.value.length; j++) {
                    updates.push([linenum, linenum + lineoffset - lineoffset, true, diff.value[j]])
                    linenum++
                }


                continue
            }


            for (let j = 0; j < diff.value.length; j++) {
                updates.push([linenum, linenum + lineoffset, false, diff.value[j]])
                linenum++

            }
        }

        let v = updates.map(t => t[0] == t[1] ? (t[2] ? '+' : ' ') : t[1])
        setMapped(v)
        console.log(JSON.stringify(v, null, 4))
        console.log(JSON.stringify(updates, null, 4))
    }

    return <div className="flex flex-col items-center gap-4 bg-background-base w-full h-full py-6 overflow-y-scroll">
        <div className='flex gap-3 bg-background-900 py-3 px-1 w-fit h-fit rounded-lg'>
            <div className='flex items-end flex-col w-6 text-text-300'>
                {value.split('\n').map((_, idx) => <span key={idx}>{idx + 1}</span>)}
            </div>
            <textarea className='text-text-50' ref={textarea} onChange={onchange} value={value} style={{ 'width': '700px', 'backgroundColor': 'transparent', 'outline': 'none', 'textWrap': 'nowrap', 'resize': 'none', }} />
            <div className='flex items-start flex-col w-6 text-text-300'>
                {mapped.map((i, idx) => <span key={idx} style={{ 'height': '24.8px' }}>{i}</span>)}
            </div>
        </div>
        <div className='' style={{ 'width': '780px' }}>
            <Button>Save</Button>
        </div>
    </div>
}
