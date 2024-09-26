'use client'
import { Textarea } from '@mantine/core'
import { useRef, useState } from 'react'
import { cyrb53 } from '../cachedb/index'

function lineChanges(lines: { content: string; type: 'created' | 'deleted' | 'updated' }[]) {
    console.log(JSON.stringify(lines, null, 4))
}

export default function Page() {
    return <div>metadata</div>
}
