"use client"

import ApolloProvider from "@/modules/ApolloProvider"
import { totalAmountAtom } from "@/store/cart.store"
import { atom, Provider } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { modeT } from "@/types/config.types"
import { IPaymentAmountType } from "@/types/order.types"

import { setInitialAtom } from "./order.store"

// products
export const searchAtom = atom<string>("")
export const activeCategoryAtom = atom<string>("")
export const activeCatName = atom<string>("")
export const hiddenParentsAtom = atom<string[]>([])

// local
export const currentAmountAtom = atom<number>(0)

export const modeAtom = atomWithStorage<modeT>("mode", "main")

export const currentPaymentTypeAtom = atom<string>("")

export const paymentAmountTypeAtom = atom<IPaymentAmountType>("amount")

export const displayAmountAtom = atom<number>((get) =>
  get(paymentAmountTypeAtom) === "percent"
    ? Number(((get(currentAmountAtom) / get(totalAmountAtom)) * 100).toFixed(1))
    : get(currentAmountAtom)
)

export const customerSearchAtom = atom<string>("")

export const reportDateAtom = atom<Date | null>(null)

export const productCountAtom = atom<number>(0)

export const selectedTabAtom = atom<"plan" | "products">("plan")

export const slotFilterAtom = atom<string | null>(null)

export const refetchUserAtom = atom<boolean>(false)

export const refetchOrderAtom = atomWithStorage<boolean>("refetchOrder", false)
export const paymentDataAtom = atomWithStorage<null | {
  kind: string
  qrData: string
  amount: number
}>("paymentData", null)
export const invoiceIdAtom = atom<null | string>(null)

// dialog

export const checkoutModalViewAtom = atom<string>("")

export const checkoutDialogOpenAtom = atom<boolean>(false)

export const ebarimtMainDialogOpenAtom = atom<boolean>(false)

export const orderCollapsibleAtom = atom<boolean>(false)

export const scrollWidthAtom = atomWithStorage<number>("scrollWidth", 8)

export const mobileTabAtom = atomWithStorage<"products" | "checkout">(
  "mobileTab",
  "products"
)

export const resetAtom = atom(
  () => "",
  (get, set) => {
    set(setInitialAtom)
    set(activeCategoryAtom, "")
    set(slotFilterAtom, null)
    set(refetchUserAtom, true)
  }
)

const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ApolloProvider>{children}</ApolloProvider>
    </Provider>
  )
}

export type SetAtom<Args extends any[], Result> = (...args: Args) => Result

export default JotaiProvider
