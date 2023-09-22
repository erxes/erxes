import Link from "next/link"
import Logout from "@/modules/auth/components/logout"
import { configAtom } from "@/store/config.store"
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

import { cn, getMode } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { Separator } from "../ui/separator"

const HeaderMenu = () => {
  const mode = getMode()
  const config = useAtomValue(configAtom)
  const menu =
    mode === "market"
      ? supermarketMenu
      : supermarketMenu.concat(
          config?.waitingScreen?.isActive
            ? [progressMenu, waitingMenu]
            : progressMenu
        )
  return (
    <div
      className={cn(
        "h-10 rounded-md bg-neutral-100",
        mode === "market" && "sm:ml-2",
        ["main", "coffee-shop"].includes(mode) && "sm:mr-2"
      )}
    >
      <NavigationMenu className="p-1">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto rounded-md bg-white p-1"
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-[200px] p-3">
                {menu.map((itm) => (
                  <MenuItem {...itm} key={itm.href} />
                ))}
                <Separator className="mx-3 w-auto" />
                <Logout />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const MenuItem = ({ href, Icon, text }: any) => (
  <li>
    <Link href={`/${href}`}>
      <NavigationMenuLink asChild>
        <Button className="w-full justify-start" variant="ghost">
          <Icon className="mr-2 h-5 w-5" />
          {text}
        </Button>
      </NavigationMenuLink>
    </Link>
  </li>
)

const supermarketMenu = [
  {
    href: "history",
    Icon: HistoryIcon,
    text: "Захиалгын түүх",
  },
  {
    href: "report",
    Icon: FileBarChart2Icon,
    text: "Тайлан",
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
