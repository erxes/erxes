"use client"

import { FunctionComponent } from "react"
import { usePathname } from "next/navigation"
import SideBarItem from "@/modules/sidebar/component/SidebarItem"
import {
  BookOpen,
  BookUserIcon,
  Building,
  Clock,
  GitForkIcon,
  HomeIcon,
  MessageCircleIcon,
  RssIcon,
  StarIcon,
} from "lucide-react"

interface SidebarProps {}

const Sidebar: FunctionComponent<SidebarProps> = () => {
  const pathname = usePathname()

  return (
    <div className="w-full h-full">
      <ul className="list-none">
        <SideBarItem
          href="/"
          isActive={pathname === "/" ?? true}
          Icon={HomeIcon}
          value="Overview"
        />

        {Object.entries(MAIN_NAVIGATION).map(([key, arrays], ind) => (
          <div key={ind} className="flex flex-col">
            <h2 className="px-4 py-2 capitalize text-base font-bold">{key}</h2>
            {arrays.map((items, index) => {
              const isActive = pathname.startsWith(`/${items.href}`)

              return <SideBarItem key={index} {...items} isActive={isActive} />
            })}
          </div>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar

export const MAIN_NAVIGATION = {
  communication: [
    {
      href: "feed",
      value: "Feed",
      Icon: RssIcon,
    },
    {
      href: "chat",
      value: "Chat",
      Icon: MessageCircleIcon,
    },
  ],
  directory: [
    {
      href: "contacts",
      value: "Contacts",
      Icon: BookUserIcon,
    },
    {
      href: "company",
      value: "Company",
      Icon: Building,
    },
    {
      href: "org-chart",
      value: "Org chart",
      Icon: GitForkIcon,
    },
  ],
  operations: [
    {
      href: "timeclock",
      value: "Timeclock",
      Icon: Clock,
    },
    {
      href: "learn",
      value: "Learn",
      Icon: BookOpen,
    },
    {
      href: "discover",
      value: "Discover",
      Icon: StarIcon,
    },
  ],
}
