import { IconLayoutSidebarLeftExpand, IconMenu2 } from "@tabler/icons-react"
import { useAtom, useSetAtom } from "jotai"

import { Button } from "@/components/ui/button"
import {
  sidebarOpenAtom,
  sidebarSheetOpenAtom,
  useSidebarMode,
} from "@/components/sidebar/appSidebar"

const HeaderMenu = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom)
  const setSheetOpen = useSetAtom(sidebarSheetOpenAtom)
  const { inline } = useSidebarMode()

  if (inline && open) return null

  const label = inline ? "Expand sidebar" : "Open sidebar"

  return (
    <Button
      aria-expanded={false}
      aria-label={label}
      title={label}
      className="size-7 shrink-0 p-0"
      type="button"
      variant="ghost"
      onClick={() => (inline ? setOpen(true) : setSheetOpen(true))}
    >
      {inline ? (
        <IconLayoutSidebarLeftExpand className="size-4" />
      ) : (
        <IconMenu2 className="size-4" />
      )}
    </Button>
  )
}

export default HeaderMenu
