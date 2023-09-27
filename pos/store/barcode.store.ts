import { atom } from "jotai"

// barcode
export const barcodeAtom = atom<string>("")
export const getBarcodeAtom = atom((get) => get(barcodeAtom))
export const setBarcodeAtom = atom(null, (get, set, update: string) => {
  set(barcodeAtom, update)
})
