import Link from "next/link"
import { usePathname } from "next/navigation"
import Logout from "@/modules/auth/components/logout"
import { modeAtom } from "@/store"
import {
  configAtom,
  currentUserAtom,
  permissionConfigAtom,
} from "@/store/config.store"
import { useAtomValue } from "jotai"
import {
  FileBarChart2Icon,
  HistoryIcon,
  HourglassIcon,
  LucideIcon,
  MenuIcon,
  PackagePlus,
  SettingsIcon,
  TimerResetIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { headerMenuItemClass } from "./headerMenuItemClass"

const HeaderMenu = () => {
  const pathname = usePathname()
  const mode = useAtomValue(modeAtom)
  const user = useAtomValue(currentUserAtom)
  const permissionConfig = useAtomValue(permissionConfigAtom)
  const { waitingScreen, kitchenScreen, adminIds } =
    useAtomValue(configAtom) || {}

  const getMenu = () => {
    const menu = [...supermarketMenu]
    if (adminIds?.includes(user?._id || "")) {
      menu.push({
        href: "order-logs",
        Icon: HistoryIcon,
        text: "Өөрчлөлтийн лог",
      })
    }
    if (mode === "market") return menu
    if (kitchenScreen?.isActive) {
      menu.push(progressMenu)
    }
    if (waitingScreen?.isActive) {
      menu.push(waitingMenu)
    }
    if (adminIds?.includes(user?._id || "") || permissionConfig?.seeReport) {
      menu.push(reportMenu)
    }

    return menu
  }

  const menu = getMenu()

  return (
    <div
      className={cn(
        "flex flex-none items-center justify-center",
        mode === "market" && "sm:ml-2",
        ["main", "coffee-shop"].includes(mode) && "sm:mr-2"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-md p-0 text-muted-foreground transition-colors hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
            aria-label="Цэс"
          >
            <MenuIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-56 rounded-md bg-background p-1 shadow-lg"
        >
          {menu.map((itm) => (
            <MenuItem
              {...itm}
              key={itm.href}
              active={pathname === `/${itm.href}`}
            />
          ))}
          <DropdownMenuSeparator className="-mx-1 my-1" />
          <Logout />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const MenuItem = ({
  href,
  Icon,
  text,
  active,
}: {
  href: string
  Icon: LucideIcon
  text: string
  active?: boolean
}) => (
  <DropdownMenuItem asChild>
    <Link
      href={`/${href}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        headerMenuItemClass,
        active &&
          "bg-primary/10 font-medium text-primary focus:bg-primary/10 [&>svg]:text-primary"
      )}
    >
      <Icon aria-hidden="true" />
      {text}
    </Link>
  </DropdownMenuItem>
)

const supermarketMenu = [
  {
    href: "history",
    Icon: HistoryIcon,
    text: "Захиалгын түүх",
  },
  {
    href: "cover",
    Icon: TimerResetIcon,
    text: "Хаалт",
  },
  {
    href: "settings",
    Icon: SettingsIcon,
    text: "Тохиргоо",
  },
]

const reportMenu = {
  href: "report",
  Icon: FileBarChart2Icon,
  text: "Тайлан",
}

const progressMenu = {
  href: "progress",
  Icon: PackagePlus,
  text: "Бэлтгэл",
}

const waitingMenu = {
  href: "waiting",
  Icon: HourglassIcon,
  text: "Хүлээлгэ",
}

export default HeaderMenu
