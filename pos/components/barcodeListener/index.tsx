import { useCallback, useEffect, useState } from "react"
import { barcodeAtom } from "@/store/barcode.store"
import { disableBarcodeAtom } from "@/store/ui.store"
import { differenceInMilliseconds } from "date-fns"
import { useAtomValue, useSetAtom } from "jotai"

const BarcodeListener = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState("")
  const [changeDate, setChangeDate] = useState<number>(0)
  const disableBarcode = useAtomValue(disableBarcodeAtom)
  const setBarcode = useSetAtom(barcodeAtom)

  const handleKeyPress = useCallback(
    ({ key }: { key: string }) => {
      const date = new Date()
      const diff = differenceInMilliseconds(changeDate, date)
      if (diff < 30) {
        if ((key || "").length === 1) {
          setValue(value + key)
          setChangeDate(Date.now())
          return
        }
        if (key === "Enter") {
          if (value.length > 8) {
            setBarcode(value)
          } else {
            setBarcode("")
          }
          setChangeDate(Date.now())
          setValue("")
        }
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
