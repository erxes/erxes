import { atom } from "jotai"

// ui
export const searchPopoverAtom = atom<boolean>(false)
export const changeFocusAtom = atom<boolean>(false)
export const paymentSheetAtom = atom<boolean>(false)
export const ebarimtSheetAtom = atom<boolean>(false)
export const customerPopoverAtom = atom<boolean>(false)
export const disableBarcodeAtom = atom(
  (get) => get(searchPopoverAtom) || get(customerPopoverAtom)
)
