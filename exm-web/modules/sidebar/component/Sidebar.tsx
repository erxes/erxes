"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  AwardIcon,
  CalendarClock,
  HomeIcon,
  MessageCircleIcon,
  ScrollTextIcon,
  StarIcon,
  Users2Icon,
} from "lucide-react"

import Image from "@/components/ui/image"

import { useChatNotif } from "../hooks/useChatNotif"

export const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeClass, setActiveClass] = useState(
    pathname ? pathname.split("/")[1] || "/" : "/"
  )

  const { unreadCount, refetch } = useChatNotif()

  const handleLink = (href: string) => {
    router.replace(`/${href}`)
    setActiveClass(href)
  }

  useEffect(() => {
    if (pathname) {
      refetch()
    }
  }, [pathname])

  const NavigationItem = ({
    href,
    active,
    Icon,
    value,
    color,
    backgroundClass,
    desc,
  }: any) => {
    return (
      <li
        className={`${
          activeClass === active ? "shadow-md text-black" : ""
        } mb-4 flex items-center hover:bg-white rounded-xl hover:shadow-md text-black hover:text-black cursor-pointer hover:transition-all`}
        onClick={() => handleLink(href)}
      >
        <div className="relative p-3">
          <div
            className={`${
              activeClass === active ? backgroundClass : "bg-white"
            } ${
              pathname.includes("/chat") ? "" : ""
            } shadow-md p-2 rounded-lg relative`}
          >
            <Icon
              size={18}
              color={activeClass === active ? "#ffffff" : color}
            />
          </div>
          {active === "chats" && unreadCount > 0 ? (
            <div className="absolute top-2 right-2">
              <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            </div>
          ) : null}
        </div>
        {activeClass.includes("chat") ? (
          ""
        ) : (
          <div className="flex flex-col">
            <span
              className={`${
                activeClass === active ? "text-[#444]" : "text-[#A0AEC0]"
              }`}
            >
              {value}
            </span>
            <span className="text-[8px] text-[#A0AEC0]">{desc}</span>
          </div>
        )}
      </li>
    )
  }

  return (
    <div
      className={`h-full p-4 border-r border-[#eee]  ${
        pathname.includes("/chat") ? "" : "w-[17%] shrink-0 flex-0"
      }`}
    >
      <div className="w-full pb-2 mb-4 flex justify-center">
        <Image
          alt=""
          src="/logo-dark.svg"
          height={100}
          width={100}
          className={`${
            pathname.includes("/chat") ? "w-10 h-10" : "w-20 h-10"
          }`}
        />
      </div>

      <div className="w-full h-full">
        <ul className="list-none">
          {MAIN_NAVIGATION.map((item, i) => (
            <NavigationItem {...item} key={i} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export const MAIN_NAVIGATION = [
  {
    active: "/",
    href: "/",
    value: "Feed",
    Icon: HomeIcon,
    color: "#6569DF",
    backgroundClass: "bg-[#6569DF]",
  },
  {
    active: "chats",
    href: "chats",
    value: "Chats",
    Icon: MessageCircleIcon,
    color: "#FDA50D",
    backgroundClass: "bg-[#FDA50D]",
  },
  {
    active: "company",
    href: "company",
    value: "Company",
    Icon: Users2Icon,
    color: "#3B85F4",
    backgroundClass: "bg-[#3B85F4]",
  },
  {
    active: "discover",
    href: "#",
    value: "Discover",
    Icon: StarIcon,
    color: "#EA475D",
    desc: "Coming soon",
    backgroundClass: "bg-[#EA475D]",
  },
  {
    active: "learn",
    href: "#",
    value: "Learn",
    Icon: ScrollTextIcon,
    color: "#3CCC38",
    desc: "Coming soon",
    backgroundClass: "bg-[#3CCC38]",
  },
  {
    active: "leaderboard",
    href: "#",
    value: "Leaderboard",
    Icon: AwardIcon,
    color: "#FF6600",
    desc: "Coming soon",
    backgroundClass: "bg-[#FF6600]",
  },
  {
    active: "timeclocks",
    href: "timeclocks",
    value: "Timeclocks",
    Icon: CalendarClock,
    color: "#3d91a9",
    backgroundClass: "bg-[#3d91a9]",
  },
]
