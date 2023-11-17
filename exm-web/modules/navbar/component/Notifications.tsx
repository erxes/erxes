"use client"

import { useEffect } from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Ban, BellRing } from "lucide-react"
import { useInView } from "react-intersection-observer"

import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useNotification } from "../hooks/useNotification"
import { INotification } from "../types"

dayjs.extend(relativeTime)

const Notifications = () => {
  const {
    notifications,
    markAsRead,
    loading,
    notificationsCount,
    unreadCount,
    handleLoadMore,
  } = useNotification()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  useEffect(() => {
    if (inView) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  const tabTriggerStyle =
    "text-[#444] data-[state=active]:bg-[#9585CF] data-[state=active]:text-white data-[state=active]:rounded-[5px] data-[state=active]:font-medium h-8 w-fit flex-none hover:text-[#444] hover:font-medium px-3 py-1 "

  const renderContent = (content: string, type: string) => {
    if (!type.includes("conversation")) {
      return <b>{content}</b>
    }

    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }

  const renderNotifInfo = (notification: INotification) => {
    if (notification.action === "post created") {
      return (
        <span>
          {notification.action}{" "}
          {renderContent(notification.content, notification.notifType)}
        </span>
      )
    }
    if (notification.action === "bravo created") {
      return <span>Mentioned you in bravo</span>
    }
    if (notification.action === "event created") {
      return <span>Created event</span>
    }
    if (notification.action === "publicHoliday created") {
      return <span>Created public holiday</span>
    }
  }

  const notificationClick = (notification: INotification) => {
    if (!notification.isRead) {
      markAsRead([notification._id])
    }

    return (window.location.href = `detail?contentType=${
      notification.action.split(" ")[0]
    }&id=${notification.link.slice(28)}`)
  }

  const renderNotifRow = (notification: INotification) => {
    const { details = {}, username = "", email } = notification.createdUser
    const { avatar, fullName } = details || {}

    return (
      <li
        key={notification._id}
        onClick={() => notificationClick(notification)}
        className="flex gap-2 p-3 cursor-pointer hover:bg-[#F0F0F0] items-center justify-between"
      >
        <div className="flex gap-2 items-center">
          <div className="w-10 h-10 shrink-0">
            <Image
              src={
                Object.keys(details || {}).length > 0 && avatar
                  ? avatar
                  : "/avatar-colored.svg"
              }
              alt="User Profile"
              width={80}
              height={80}
              className="w-10 h-10 rounded-full object-cover border border-primary"
            />
          </div>
          <div className="text-[12px]">
            <div className="flex flex-col">
              <b>
                {Object.keys(details || {}).length > 0
                  ? fullName
                  : username || email}{" "}
              </b>
              {renderNotifInfo(notification)}
            </div>
            <div
              className={`${
                !notification.isRead && "text-primary-light"
              } text-[#5E5B5B] text-[11px]`}
            >
              {dayjs(notification.date).fromNow()}
            </div>
          </div>
        </div>
        {!notification.isRead && (
          <div className="h-2.5 w-2.5 bg-primary-light rounded-full shrink-0" />
        )}
      </li>
    )
  }

  const renderLoadMore = () => {
    if (loading || notifications.length === notificationsCount) {
      return null
    }

    return (
      <div ref={ref}>
        <Loader />
      </div>
    )
  }

  const renderNoNotification = () => {
    return (
      <div className="gap-3 flex flex-col justify-center items-center py-4 text-[#A1A1A1]">
        <Ban size={25} />
        There is no notification
      </div>
    )
  }

  const renderNotification = (isUnread?: boolean) => {
    if (
      isUnread
        ? notifications.filter((notif) => !notif.isRead).length === 0
        : notifications.length === 0
    ) {
      return renderNoNotification()
    }

    return (
      <>
        {notifications.map((notification) => renderNotifRow(notification))}
        {renderLoadMore()}
      </>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <div className="p-2.5 bg-[#F0F0F0] rounded-full mr-4 relative cursor-pointer">
          <BellRing size={16} />
          {unreadCount > 0 && (
            <div className="absolute top-[-6px] right-[-9px] bg-destructive text-white text-[9px] flex w-[20px] justify-center items-center rounded-full">
              {unreadCount}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="mr-8 w-80 shadow-notification border-none p-0">
        <Tabs defaultValue="all">
          <TabsList>
            <div className="flex gap-3 p-3">
              <TabsTrigger className={tabTriggerStyle} value="all">
                All
              </TabsTrigger>
              <TabsTrigger className={tabTriggerStyle} value="unread">
                Unread
              </TabsTrigger>
            </div>
          </TabsList>
          <p className="font-normal mb-3 px-3 flex justify-between text-[13px]">
            Earlier{" "}
            <span
              className="text-primary cursor-pointer"
              onClick={() => markAsRead([])}
            >
              Mark all as read
            </span>
          </p>
          <TabsContent value="all">
            <ul className="max-h-[300px] overflow-y-auto">
              {renderNotification()}
            </ul>
          </TabsContent>
          <TabsContent value="unread">{renderNotification(true)}</TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

export default Notifications
