import { useCallback, useEffect, useState } from "react"
import { barcodeAtom } from "@/store/barcode.store"
import { disableBarcodeAtom } from "@/store/ui.store"
import { differenceInMilliseconds } from "date-fns"
import { useAtomValue, useSetAtom } from "jotai"

const BarcodeListener = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState("")
  const [changeDate, setChangeDate] = useState<Date | null>()
  const disableBarcode = useAtomValue(disableBarcodeAtom)
  const setBarcode = useSetAtom(barcodeAtom)

  const handleKeyPress = useCallback(
    ({ key }: { key: string }) => {
      const date = new Date()
      const diff =
        differenceInMilliseconds(date, new Date(changeDate || 0)) < 30

      if ((key || "").length === 1) {
        setValue((prev) => (diff ? prev + key : key.toString()))
        return setChangeDate(date)
      }

      if (key === "Enter" && value.length > 4 && diff) {
        setBarcode(value)
        setValue("")
      }
    },
    [changeDate, setBarcode, value]
  )

  useEffect(() => {
    if (disableBarcode) {
      return
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [changeDate, value, handleKeyPress, disableBarcode])
  return <>{children}</>
}

export default BarcodeListener
