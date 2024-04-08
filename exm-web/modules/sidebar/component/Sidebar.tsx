"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  BookUserIcon,
  Building,
  Clock,
  GitForkIcon,
  HomeIcon,
  MessageCircleIcon,
  Rss,
  StarIcon,
} from "lucide-react"

import { useChatNotif } from "../hooks/useChatNotif"

export const Sidebar = () => {
  const pathname = usePathname()
  const [activeClass, setActiveClass] = useState(
    pathname ? pathname.split("/")[1] || "/" : "/"
  )

  const { unreadCount, refetch } = useChatNotif()

  const handleLink = (href: string) => {
    setActiveClass(href)
  }

  useEffect(() => {
    if (pathname) {
      refetch()
    }
  }, [pathname])

  const NavigationItem = ({ href, active, Icon, value, desc }: any) => {
    return (
      <Link href={`/${href}`} passHref={true}>
        <li
          className={`${
            activeClass === active
              ? "bg-[#F9FAFB] border-t border-b border-exm"
              : ""
          } flex px-[16px] py-[12px] h-[58px] items-center  text-black hover:text-black cursor-pointer hover:transition-all`}
          onClick={() => handleLink(href)}
        >
          <div className="pr-[9px]">
            <Icon
              size={18}
              color={activeClass === active ? "#5B38CA" : "#667085"}
            />
            {active === "chats" && unreadCount > 0 ? (
              <div className="absolute top-2 right-2">
                <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {unreadCount}
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[16px] font-medium ${
                activeClass === active ? "text-[#5B38CA]" : "text-[#667085]"
              }`}
            >
              {value}
            </span>
            <span className="text-[8px] text-[#A0AEC0]">{desc}</span>
          </div>
          {active === "chats" && unreadCount > 0 ? (
            <div className="ml-auto float-right">
              <span className="bg-primary text-white rounded-lg w-6 h-6 flex items-center justify-center text-xs">
                {"+" + unreadCount}
              </span>
            </div>
          ) : null}
        </li>
      </Link>
    )
  }

  return (
    <div className={`h-full border-r border-[#eee] w-[230px] shrink-0 flex-0}`}>
      <div className="w-full h-full">
        <ul className="list-none">
          <NavigationItem
            active="/"
            href="/"
            value="Overview"
            Icon={HomeIcon}
          />
          {Object.entries(MAIN_NAVIGATION).map(([key, arrays], ind) => (
            <div key={ind}>
              <h2 className="px-[16px] py-[8px] capitalize text-[16px] font-bold">
                {key}
              </h2>
              {arrays.map((items, index) => (
                <NavigationItem key={index} {...items} />
              ))}
            </div>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const MAIN_NAVIGATION = {
  communication: [
    {
      active: "feed",
      href: "feed",
      value: "Feed",
      Icon: Rss,
    },
    {
      active: "chats",
      href: "chats",
      value: "Chats",
      Icon: MessageCircleIcon,
    },
  ],
  directory: [
    {
      active: "contacts",
      href: "contacts",
      value: "Contacts",
      Icon: BookUserIcon,
    },
    {
      active: "company",
      href: "company",
      value: "Company",
      Icon: Building,
    },
    {
      active: "org-chart",
      href: "org-chart",
      value: "Org chart",
      Icon: GitForkIcon,
    },
  ],
  operations: [
    {
      active: "timeclock",
      href: "timeclock",
      value: "Timeclock",
      Icon: Clock,
    },
    {
      active: "learn",
      href: "learn",
      value: "Learn",
      Icon: BookOpen,
    },
    {
      active: "discover",
      href: "discover",
      value: "Discover",
      Icon: StarIcon,
    },
  ],
}
