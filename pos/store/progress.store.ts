"use client"

import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { IFilter } from "@/types/history.types"
import { ORDER_STATUSES } from "@/lib/constants"

import { defaultFilter } from "./history.store"

export const filterAtom = atom<IFilter>({
  ...defaultFilter,
  statuses: ORDER_STATUSES.ACTIVE,
})

export const showFilterAtom = atomWithStorage("showFilter", false)
export const showItemsAtom = atomWithStorage("showItems", false)
export const columnNumberAtom = atomWithStorage("columnNumber", 2)
export const showRecieptAtom = atom<string | null>(null)
