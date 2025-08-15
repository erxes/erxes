"use client"

import ApolloProvider from "@/modules/ApolloProvider"
import { totalAmountAtom } from "@/store/cart.store"
import { atom, Provider } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { modeT } from "@/types/config.types"
import { IPaymentAmountType } from "@/types/order.types"

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

// order

export const orderNotificationEnabledAtom = atomWithStorage<boolean>(
  "orderNotificationEnabled",
  false
)

// supplement
export const userNameAtom = atomWithStorage<string>("userName", "")
export const userBankAddressAtom = atomWithStorage<string>(
  "userBankAddress",
  ""
)
export const accountTypeAtom = atomWithStorage<"person" | "company">(
  "accountType",
  "person"
)
export const companyRegisterAtom = atomWithStorage<string>(
  "companyRegister",
  ""
)
export const invoiceExpiryDaysAtom = atomWithStorage<number>(
  "invoiceExpiryDays",
  14
)

export const printModalOpenAtom = atom<boolean>(false)

// dialog

export const checkoutModalViewAtom = atom<string>("")

export const checkoutDialogOpenAtom = atom<boolean>(false)

export const ebarimtMainDialogOpenAtom = atom<boolean>(false)

export const orderCollapsibleAtom = atom<boolean>(false)

export const scrollWidthAtom = atomWithStorage<number>("scrollWidth", 8)

export const printOnlyNewItemsAtom = atomWithStorage<boolean>(
  "printOnlyNew",
  false
)

const migrateCategoriesData = (stored: any): string[][] => {
  if (!stored) return [[]]
  if (Array.isArray(stored) && stored.length > 0 && Array.isArray(stored[0])) {
    return stored as string[][]
  }
  if (
    Array.isArray(stored) &&
    stored.length > 0 &&
    typeof stored[0] === "string"
  ) {
    return [stored as string[]]
  }
  return [[]]
}

export const categoriesToPrintAtom = atomWithStorage<string[][]>(
  "categoriesToPrint",
  [[]],
  {
    getItem: (key, initialValue) => {
      try {
        const stored = localStorage.getItem(key)
        if (stored === null) return initialValue
        const parsed = JSON.parse(stored)
        return migrateCategoriesData(parsed)
      } catch {
        return initialValue
      }
    },
    setItem: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    },
  }
)

export const mobileTabAtom = atomWithStorage<"products" | "checkout">(
  "mobileTab",
  "products"
)

export const nextOrderIdAtom = atom<string | null>(null)

export const resetAtom = atom(
  () => "",
  (get, set) => {
    set(activeCategoryAtom, "")
    set(refetchUserAtom, true)
    set(nextOrderIdAtom, "-")
    set(orderNotificationEnabledAtom, false)
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
