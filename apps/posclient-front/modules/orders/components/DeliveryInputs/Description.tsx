import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
} from "@/modules/record-side-panel"
import { descriptionAtom } from "@/store/order.store"
import { useAtom } from "jotai"
import { AlignLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

const Description = () => {
  const [description, setDescription] = useAtom(descriptionAtom)

  return (
    <PanelFormRow label="Тайлбар" icon={AlignLeftIcon}>
      <Textarea
        id="delivery"
        aria-label="Тайлбар"
        placeholder="Тайлбар бичих"
        className={cn(
          PANEL_INPUT_CLASS_NAME,
          "h-auto min-h-7 max-h-20 resize-none py-1.5"
        )}
        rows={1}
        value={description || ""}
        onChange={(e) => setDescription(e.target.value)}
      />
    </PanelFormRow>
  )
}

export default Description
