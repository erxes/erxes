import Link from "next/link"
import Logout from "@/modules/auth/components/logout"
import { modeAtom } from "@/store"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import {
  FileBarChart2Icon,
  HistoryIcon,
  HourglassIcon,
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
  const { waitingScreen, kitchenScreen, adminIds } =
    useAtomValue(configAtom) || {}

  const getMenu = () => {
    if (mode === "market") return supermarketMenu
    let menu = [...supermarketMenu]
    if (kitchenScreen?.isActive) {
      menu.push(progressMenu)
    }
    if (waitingScreen?.isActive) {
      menu.push(waitingMenu)
    }
    if (adminIds?.includes(user?._id || "")) {
      menu.push(reportMenu)
    }

    return menu
  }

  const menu = getMenu()

  return (
    <div
      className={cn(
        "p-1 rounded-md bg-neutral-100 flex items-center justify-center",
        mode === "market" && "sm:ml-2",
        ["main", "coffee-shop"].includes(mode) && "sm:mr-2"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto rounded-sm bg-white p-1">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-3 min-w-[200px]">
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

const MenuItem = ({ href, Icon, text }: any) => (
  <DropdownMenuItem asChild>
    <Button
      className="w-full justify-start mb-1"
      variant="ghost"
      size="sm"
      Component={Link}
      href={`/${href}`}
    >
      <Icon className="mr-2 h-5 w-5" />
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
