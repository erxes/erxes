"use client"

import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const PROGRESS_FILTER_ID = "orders-progress"

export const showFilterAtom = atomWithStorage("showFilter", false)
export const showItemsAtom = atomWithStorage("showItems", false)
export const columnNumberAtom = atomWithStorage("columnNumber", 2)
export const showRecieptAtom = atom<string | null>(null)
