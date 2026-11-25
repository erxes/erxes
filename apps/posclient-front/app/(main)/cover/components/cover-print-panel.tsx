import { useRef, useState } from "react"
import { RecordSidePanel, usePanelWidth } from "@/modules/record-side-panel"
import { modeAtom } from "@/store"
import { coverPrintIdAtom } from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"
import { PrinterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const CoverPrintPanel = () => {
  const [printId, setPrintId] = useAtom(coverPrintIdAtom)
  const isMobile = useAtomValue(modeAtom) === "mobile"
  const [panelWidth, setPanelWidth] = usePanelWidth(
    "pos_cover_print_panel_width"
  )
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)

  if (!printId) return null

  return (
    <RecordSidePanel
      width={panelWidth}
      onWidthChange={isMobile ? undefined : setPanelWidth}
      expanded={isMobile || undefined}
      expandable={false}
    >
      <RecordSidePanel.Header
        avatar={
          <span className="flex size-7 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PrinterIcon className="size-4" aria-hidden="true" />
          </span>
        }
        title="Хаалтын баримт"
        onClose={() => setPrintId(null)}
      />
      <iframe
        ref={frameRef}
        key={printId}
        title="Хаалтын баримт"
        src={`/reciept/cover?id=${printId}&embed=1`}
        onLoad={() => setLoadedId(printId)}
        className="min-h-0 w-full flex-1 border-0 bg-sidebar"
      />
      <div className="flex h-14 flex-none items-center justify-end gap-2 border-t bg-background px-5">
        <Button
          type="button"
          variant="outline"
          className="h-8 rounded px-3 text-[13px] font-medium"
          onClick={() => setPrintId(null)}
        >
          Болих
        </Button>
        <Button
          type="button"
          className="h-8 gap-1.5 rounded px-3 text-[13px] font-medium"
          disabled={loadedId !== printId}
          loading={!!printId && loadedId !== printId}
          onClick={() => frameRef.current?.contentWindow?.print()}
        >
          {loadedId === printId && <PrinterIcon className="size-4" />}
          Хэвлэх
        </Button>
      </div>
    </RecordSidePanel>
  )
}
