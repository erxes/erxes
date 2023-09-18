import { atom } from "jotai"

// ui
export const searchPopoverAtom = atom<boolean>(false)
export const setSearchPopoverAtom = atom(null, (get, set, update: boolean) => {
  set(searchPopoverAtom, update)
})
export const logoUrlAtom = atom<string>("")
export const setLogoUrlAtom = atom(null, (get, set, update: string) => {
  set(logoUrlAtom, update)
})
export const paymentSheetAtom = atom<boolean>(false)
export const setPaymentSheetAtom = atom(null, (get, set, update: boolean) => {
  set(paymentSheetAtom, update)
})
export const ebarimtSheetAtom = atom<boolean>(false)
export const setEbarimtSheetAtom = atom(null, (get, set, update: boolean) =>
  set(ebarimtSheetAtom, update)
)
export const customerPopoverAtom = atom<boolean>(false)
