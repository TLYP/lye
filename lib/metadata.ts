/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-empty-pattern */

import { createSlice } from '@reduxjs/toolkit'

export type MetadataState = {}

const initialState = {}

const MetadataSlice = createSlice({
    name: 'metadata',
    initialState,
    reducers: {}
})

export const {} = MetadataSlice.actions
export default MetadataSlice.reducer
