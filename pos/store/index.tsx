"use client"

import { atom, Provider } from "jotai"

import { getMode } from "@/lib/utils"

// products
export const searchAtom = atom<string>("")
export const activeCategoryAtom = atom<string>("")
export const activeCatName = atom<string>("")
export const hiddenParentsAtom = atom<string[]>([])

// local
export const currentAmountAtom = atom<number>(0)

export const currentPaymentTypeAtom = atom<string>(
  getMode() === "market" ? "cash" : ""
)

export const customerSearchAtom = atom<string>("")

export const reportDateAtom = atom<Date | null>(null)

export const productCountAtom = atom<number>(0)

// dialog

export const kioskModalView = atom<string>("")

export const kioskDialogOpenAtom = atom<boolean>(false)

export const ebarimtMainDialogOpenAtom = atom<boolean>(false)

const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>
}

export type SetAtom<Args extends any[], Result> = (...args: Args) => Result

export default JotaiProvider
