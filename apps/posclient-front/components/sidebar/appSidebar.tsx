"use client"

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { modeAtom } from "@/store"
import {
  configAtom,
  currentUserAtom,
  permissionConfigAtom,
} from "@/store/config.store"
import {
  Icon,
  IconChartBar,
  IconClockHour4,
  IconFileText,
  IconHistory,
  IconHourglass,
  IconLayoutSidebarLeftCollapse,
  IconPackage,
  IconSettings,
  IconShoppingCart,
} from "@tabler/icons-react"
import { atom, useAtom, useAtomValue } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { useMediaQuery } from "@/lib/useMediaQuery"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const DEFAULT_WIDTH = 240
const MIN_WIDTH = 180
const MAX_WIDTH = 480
const KEYBOARD_STEP = 16

export const sidebarOpenAtom = atomWithStorage("app-layout:pos:open", true)
const sidebarWidthAtom = atomWithStorage<number | null>(
  "app-layout:pos:width",
  null
)
export const sidebarSheetOpenAtom = atom(false)

const HIDDEN_ON = ["/settings"]
const INLINE_MODES = ["main", "market", "coffee-shop", "restaurant"]

type MenuItem = { href: string; icon: Icon; label: string }
type MenuGroup = { label: string; items: MenuItem[] }

const clampWidth = (value: number) =>
  Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value)))

const useMenu = (): MenuGroup[] => {
  const mode = useAtomValue(modeAtom)
  const user = useAtomValue(currentUserAtom)
  const permissionConfig = useAtomValue(permissionConfigAtom)
  const { waitingScreen, kitchenScreen, adminIds } =
    useAtomValue(configAtom) || {}

  const isAdmin = !!adminIds?.includes(user?._id || "")
  const isMarket = mode === "market"

  return [
    {
      label: "",
      items: [{ href: "/", icon: IconShoppingCart, label: "Борлуулалт" }],
    },
    {
      label: "Захиалга",
      items: [
        { href: "/history", icon: IconHistory, label: "Захиалгын түүх" },
        ...(!isMarket && kitchenScreen?.isActive
          ? [{ href: "/progress", icon: IconPackage, label: "Бэлтгэл" }]
          : []),
        ...(!isMarket && waitingScreen?.isActive
          ? [{ href: "/waiting", icon: IconHourglass, label: "Хүлээлгэ" }]
          : []),
        ...(isAdmin
          ? [
              {
                href: "/order-logs",
                icon: IconFileText,
                label: "Өөрчлөлтийн лог",
              },
            ]
          : []),
      ],
    },
    {
      label: "Удирдлага",
      items: [
        { href: "/cover", icon: IconClockHour4, label: "Хаалт" },
        ...(!isMarket && (isAdmin || permissionConfig?.seeReport)
          ? [{ href: "/report", icon: IconChartBar, label: "Тайлан" }]
          : []),
      ],
    },
  ]
}

export const useSidebarVisible = () => {
  const open = useAtomValue(sidebarOpenAtom)
  const { inline } = useSidebarMode()

  return inline && open
}

export const useSidebarMode = () => {
  const pathname = usePathname()
  const mode = useAtomValue(modeAtom)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const hidden = HIDDEN_ON.some((path) => pathname.startsWith(path))

  return {
    hidden,
    inline: !hidden && isDesktop && INLINE_MODES.includes(mode),
  }
}

const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)

const SidebarNavigation = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()
  const items = useMenu().flatMap((group) => group.items)

  return (
    <SidebarGroup className="px-2 py-1">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, icon: ItemIcon, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={isActivePath(pathname, href)}
              >
                <Link href={href} onClick={onNavigate}>
                  <ItemIcon />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const SidebarFooter = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()

  return (
    <div className="shrink-0 border-t px-2 py-1.5">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActivePath(pathname, "/settings")}
          >
            <Link href="/settings" onClick={onNavigate}>
              <IconSettings />
              <span className="min-w-0 flex-1 truncate">Тохиргоо</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}

const SidebarHeader = ({ onCollapse }: { onCollapse: () => void }) => {
  const config = useAtomValue(configAtom)

  return (
    <div className="flex h-10 shrink-0 items-center px-2">
      <div className="min-w-0 flex-1 truncate px-2 text-[13px] leading-4 font-medium">
        {config?.name || "POS"}
      </div>
      <Button
        aria-expanded
        aria-label="Collapse sidebar"
        className="size-8 shrink-0 rounded-md p-0"
        title="Collapse sidebar"
        type="button"
        variant="ghost"
        onClick={onCollapse}
      >
        <IconLayoutSidebarLeftCollapse className="size-4" />
      </Button>
    </div>
  )
}

const ResizeHandle = ({
  panelRef,
  onResize,
  onReset,
  onResizingChange,
}: {
  panelRef: RefObject<HTMLElement | null>
  onResize: (width: number) => void
  onReset: () => void
  onResizingChange: (resizing: boolean) => void
}) => {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null)

  const stopDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return

    drag.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    onResizingChange(false)
  }

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      title="Resize sidebar"
      className="group/resize absolute inset-y-0 right-0 z-30 w-2 cursor-col-resize touch-none outline-none"
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const panel = panelRef.current

        if (
          !panel ||
          (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
        ) {
          return
        }

        event.preventDefault()
        onResize(
          clampWidth(
            panel.offsetWidth +
              (event.key === "ArrowRight" ? KEYBOARD_STEP : -KEYBOARD_STEP)
          )
        )
      }}
      onPointerCancel={stopDrag}
      onPointerDown={(event) => {
        const panel = panelRef.current

        if (event.button !== 0 || !panel) return

        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { startX: event.clientX, startWidth: panel.offsetWidth }
        onResizingChange(true)
      }}
      onPointerMove={(event) => {
        if (!drag.current) return

        const { startX, startWidth } = drag.current
        onResize(clampWidth(startWidth + event.clientX - startX))
      }}
      onPointerUp={stopDrag}
    >
      <span className="absolute inset-y-0 right-0 w-0.5 bg-transparent transition-colors duration-150 group-hover/resize:bg-primary/40 group-focus-visible/resize:bg-primary group-active/resize:bg-primary" />
    </button>
  )
}

const DesktopSidebar = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom)
  const [width, setWidth] = useAtom(sidebarWidthAtom)
  const [resizing, setResizing] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const currentWidth = width ?? DEFAULT_WIDTH

  return (
    <aside
      ref={asideRef}
      aria-hidden={!open}
      className={cn(
        "relative flex shrink-0 flex-col overflow-hidden border-r bg-sidebar print:hidden",
        !resizing &&
          "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        !open && "border-r-0",
        resizing && "cursor-col-resize select-none"
      )}
      style={{ width: open ? currentWidth : 0 }}
    >
      <div className="flex h-full flex-col" style={{ minWidth: currentWidth }}>
        <SidebarHeader onCollapse={() => setOpen(false)} />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-1 [scrollbar-width:thin]">
          <SidebarNavigation />
        </div>
        <SidebarFooter />
      </div>
      {open && (
        <ResizeHandle
          panelRef={asideRef}
          onResize={setWidth}
          onReset={() => setWidth(null)}
          onResizingChange={setResizing}
        />
      )}
    </aside>
  )
}

const MobileSidebar = () => {
  const [open, setOpen] = useAtom(sidebarSheetOpenAtom)
  const config = useAtomValue(configAtom)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-0 border-r-0 bg-sidebar p-0 sm:max-w-72"
      >
        <SheetTitle className="flex flex-col gap-2 p-2 px-4 text-[13px] leading-4 font-medium">
          {config?.name || "POS"}
        </SheetTitle>
        <div className="min-h-0 flex-1 overflow-y-auto pb-1">
          <SidebarNavigation onNavigate={close} />
        </div>
        <SidebarFooter onNavigate={close} />
      </SheetContent>
    </Sheet>
  )
}

export const AppSidebar = () => {
  const { hidden, inline } = useSidebarMode()

  if (hidden) return null

  return inline ? <DesktopSidebar /> : <MobileSidebar />
}
