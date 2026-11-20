import Link from "next/link"
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

const HeaderMenu = () => {
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
            className="h-9 w-9 rounded-lg p-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-1.5 min-w-[220px]">
          {menu.map((itm) => (
            <MenuItem {...itm} key={itm.href} />
          ))}
          <DropdownMenuSeparator />
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
}: {
  href: string
  Icon: LucideIcon
  text: string
}) => (
  <DropdownMenuItem asChild>
    <Button
      className="w-full justify-start mb-0.5 font-medium"
      variant="ghost"
      size="sm"
      Component={Link}
      href={`/${href}`}
    >
      <Icon className="mr-2 h-5 w-5 text-muted-foreground" />
      {text}
    </Button>
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
