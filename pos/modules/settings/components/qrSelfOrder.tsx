"use client"

import { useMemo, useRef, useState } from "react"
import { useQuery } from "@apollo/client"
import { DownloadIcon, PrinterIcon, QrCodeIcon } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

import { ISlot } from "@/types/slots.type"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import { queries as slotQueries } from "@/modules/slots/graphql"

const buildQrUrl = (baseUrl: string, code: string) =>
  `${baseUrl.replace(/\/$/, "")}/qr/${encodeURIComponent(code)}`

const QrSelfOrder = () => {
  const [open, setOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ISlot | null>(null)
  const [baseUrl, setBaseUrl] = useState<string>(
    typeof window !== "undefined" ? window.location.origin : ""
  )
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  const { data, loading } = useQuery(slotQueries.slots, {
    fetchPolicy: "cache-and-network",
  })

  const slots: ISlot[] = useMemo(
    () => (data?.poscSlots || []).filter((s: ISlot) => !s?.option?.isShape),
    [data]
  )

  const handleOpen = (slot: ISlot) => {
    setActiveSlot(slot)
    setOpen(true)
  }

  const getCanvas = () =>
    canvasWrapRef.current?.querySelector(
      "canvas"
    ) as HTMLCanvasElement | null

  const handleDownload = () => {
    const canvas = getCanvas()
    if (!canvas || !activeSlot) return
    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `qr-${activeSlot.code}.png`
    link.click()
  }

  const handlePrint = () => {
    const canvas = getCanvas()
    if (!canvas || !activeSlot) return
    const dataUrl = canvas.toDataURL("image/png")
    const win = window.open("", "_blank", "width=400,height=600")
    if (!win) return
    win.document.write(`
      <html>
        <head><title>QR ${activeSlot.code}</title></head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:sans-serif;">
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:bold;margin-bottom:8px">${activeSlot.name}</div>
            <img src="${dataUrl}" />
            <div style="font-size:12px;margin-top:8px">${activeSlot.code}</div>
          </div>
          <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="w-full pb-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        <QrCodeIcon className="h-4 w-4" />
        QR Self Order ширээний кодууд
      </div>
      <div className="mb-2">
        <label className="text-xs text-neutral-500">Үндсэн URL</label>
        <Input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://example.com"
          className="h-8 text-xs"
        />
      </div>
      <div className="rounded-md border">
        {loading && !slots.length ? (
          <div className="flex h-20 items-center justify-center">
            <Loader />
          </div>
        ) : slots.length === 0 ? (
          <div className="p-3 text-center text-xs text-neutral-500">
            Ширээ олдсонгүй
          </div>
        ) : (
          <div className="divide-y">
            {slots.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between gap-2 p-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="truncate text-xs text-neutral-500">
                    {s.code}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpen(s)}
                  className="h-7 px-2 text-xs"
                >
                  <QrCodeIcon className="mr-1 h-3 w-3" /> QR
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">
              {activeSlot?.name}
              <div className="text-xs font-normal text-neutral-500">
                {activeSlot?.code}
              </div>
            </DialogTitle>
          </DialogHeader>
          {activeSlot && (
            <>
              <div
                ref={canvasWrapRef}
                className="flex justify-center bg-white p-3"
              >
                <QRCodeCanvas
                  value={buildQrUrl(baseUrl, activeSlot.code)}
                  size={220}
                  level="M"
                  includeMargin
                />
              </div>
              <div className="break-all text-center text-[10px] text-neutral-500">
                {buildQrUrl(baseUrl, activeSlot.code)}
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <DownloadIcon className="mr-1 h-3 w-3" /> Татах
                </Button>
                <Button
                  size="sm"
                  onClick={handlePrint}
                  className="flex-1"
                >
                  <PrinterIcon className="mr-1 h-3 w-3" /> Хэвлэх
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QrSelfOrder
