"use client"

import { useState } from "react"
import {
  qzCategoryPrintersAtom,
  qzMainPrinterAtom,
  qzTrayEnabledAtom,
  thermalPaperWidthAtom,
  type ThermalPaperWidth,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import useQzPrinters from "@/lib/useQzPrinters"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { SettingsRow } from "./SettingsSection"

const PAPER_WIDTHS: ThermalPaperWidth[] = ["48", "58", "72"]

const QZ_DOWNLOAD_URL = "https://qz.io/download/"

const QzTraySettings = () => {
  const [qzEnabled, setQzEnabled] = useAtom(qzTrayEnabledAtom)
  const [mainPrinter, setMainPrinter] = useAtom(qzMainPrinterAtom)
  const [paperWidth, setPaperWidth] = useAtom(thermalPaperWidthAtom)
  const setCategoryPrinters = useSetAtom(qzCategoryPrintersAtom)
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}
  const [showInstallDialog, setShowInstallDialog] = useState(false)

  const { printers, loading, error, connected, refresh } =
    useQzPrinters(qzEnabled)

  const showPrintBlock = !(isActive || !isPrint)

  const enableQz = () => {
    setQzEnabled(true)
    setShowInstallDialog(false)
  }

  const handleToggle = (isChecked: boolean) => {
    if (isChecked) {
      if (!qzEnabled) {
        setShowInstallDialog(true)
        return
      }
      setQzEnabled(true)
      return
    }

    setQzEnabled(false)
    setMainPrinter("")
    setCategoryPrinters([])
  }

  return (
    <>
      <SettingsRow
        title="Автоматаар хэвлэх"
        description="QZ Tray-ээр хэвлэх цонхгүйгээр принтер рүү шууд илгээнэ"
        htmlFor="qzTrayEnabled"
        control={
          <Switch
            id="qzTrayEnabled"
            checked={qzEnabled}
            onCheckedChange={handleToggle}
          />
        }
      >
        {qzEnabled && (
          <div className="space-y-2">
            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Цаасны өргөн
                </div>
                <Select
                  value={paperWidth}
                  onValueChange={(value) =>
                    setPaperWidth(value as ThermalPaperWidth)
                  }
                >
                  <SelectTrigger className="h-8">
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

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Үндсэн принтер
                </div>
                <Select
                  value={mainPrinter || ""}
                  onValueChange={(value) => setMainPrinter(value)}
                  disabled={!connected || loading}
                >
                  <SelectTrigger className="h-8" loading={loading}>
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
      </SettingsRow>

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QZ Tray суулгасан байх шаардлагатай</DialogTitle>
            <DialogDescription className="pt-2 space-y-2">
              <span className="block">
                Энэ функцийг ашиглахын тулд эхлээд өөрийн Mac эсвэл Windows
                компьютерт <strong>QZ Tray</strong> программыг татаж суулгасан
                байх шаардлагатай.
              </span>
              <span className="block">
                Программыг ажиллуулсны дараа доорх &quot;Идэвхжүүлэх&quot;
                товчийг дарна уу.
              </span>
              <a
                href={QZ_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block pt-1 underline text-primary"
              >
                QZ Tray татах хуудас
              </a>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInstallDialog(false)}
            >
              Цуцлах
            </Button>
            <Button onClick={enableQz}>Идэвхжүүлэх</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default QzTraySettings
