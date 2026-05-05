"use client"

import {
  qzCategoryPrintersAtom,
  qzMainPrinterAtom,
  qzTrayEnabledAtom,
  thermalPaperWidthAtom,
  type ThermalPaperWidth,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { Label } from "@radix-ui/react-label"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import useQzPrinters from "@/lib/useQzPrinters"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PAPER_WIDTHS: ThermalPaperWidth[] = ["48", "58", "72"]

const QzTraySettings = () => {
  const [qzEnabled, setQzEnabled] = useAtom(qzTrayEnabledAtom)
  const [mainPrinter, setMainPrinter] = useAtom(qzMainPrinterAtom)
  const [paperWidth, setPaperWidth] = useAtom(thermalPaperWidthAtom)
  const setCategoryPrinters = useSetAtom(qzCategoryPrintersAtom)
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  const { printers, loading, error, connected, refresh } =
    useQzPrinters(qzEnabled)

  const showPrintBlock = !(isActive || !isPrint)

  const handleToggle = (checked: boolean) => {
    setQzEnabled(checked)
    if (!checked) {
      setMainPrinter("")
      setCategoryPrinters([])
    }
  }

  return (
    <div className="w-full pb-5 space-y-2">
      <Label
        className="flex items-center w-full gap-2 cursor-pointer"
        htmlFor="qzTrayEnabled"
      >
        <Checkbox
          id="qzTrayEnabled"
          checked={qzEnabled}
          onCheckedChange={(checked: boolean) => handleToggle(!!checked)}
        />
        Автоматаар хэвлэх / QZ Tray ашиглах
      </Label>

      {qzEnabled && (
        <div className="space-y-2">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => refresh()}
                className="underline"
              >
                Дахин оролдох
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-xs text-muted-foreground">
                Хэвлэлтийн цаасны өргөн
              </div>
              <Select
                value={paperWidth}
                onValueChange={(value) =>
                  setPaperWidth(value as ThermalPaperWidth)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Өргөн сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {PAPER_WIDTHS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}mm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                Үндсэн принтер
              </div>
              <Select
                value={mainPrinter || ""}
                onValueChange={(value) => setMainPrinter(value)}
                disabled={!connected || loading}
              >
                <SelectTrigger loading={loading}>
                  <SelectValue placeholder="Принтер сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
     

          {showPrintBlock && !connected && !error && (
            <div className="text-xs text-muted-foreground">
              QZ Tray-тэй холболт үүсгэж байна...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QzTraySettings
