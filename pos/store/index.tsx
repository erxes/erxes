"use client"

import { Provider, atom } from "jotai"

import { getMode } from "@/lib/utils"

// products
export const searchAtom = atom<string>("")
export const activeCategoryAtom = atom<string>("")
export const activeCatName = atom<string>("")

// local
export const currentAmountAtom = atom<number>(0)

export const currentPaymentTypeAtom = atom<string>(
  getMode() === "market" ? "cash" : ""
)

export const customerSearchAtom = atom<string>("")

export const reportDateAtom = atom<Date | null>(null)

export const productCountAtom = atom<number>(0)

const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>
}

export type SetAtom<Args extends any[], Result> = (...args: Args) => Result

export default JotaiProvider
