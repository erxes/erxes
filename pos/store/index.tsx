"use client"

import ApolloProvider from "@/modules/ApolloProvider"
import { atom, Provider } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { modeT } from "@/types/config.types"

// products
export const searchAtom = atom<string>("")
export const activeCategoryAtom = atom<string>("")
export const activeCatName = atom<string>("")
export const hiddenParentsAtom = atom<string[]>([])

// local
export const currentAmountAtom = atom<number>(0)
export const modeAtom = atomWithStorage<modeT>("mode", "main")

export const currentPaymentTypeAtom = atom<string>("")

export const customerSearchAtom = atom<string>("")

export const reportDateAtom = atom<Date | null>(null)

export const productCountAtom = atom<number>(0)

// dialog

export const kioskModalView = atom<string>("")

export const kioskDialogOpenAtom = atom<boolean>(false)

export const ebarimtMainDialogOpenAtom = atom<boolean>(false)

export const scrollWidth = atom<number>(8)

const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ApolloProvider>{children}</ApolloProvider>
    </Provider>
  )
}

export type SetAtom<Args extends any[], Result> = (...args: Args) => Result

export default JotaiProvider
