import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type MetadataState = {}

const initialState = {}

const MetadataSlice = createSlice({
    name: 'metadata',
    initialState,
    reducers: {}
})

export const {} = MetadataSlice.actions
export default MetadataSlice.reducer
