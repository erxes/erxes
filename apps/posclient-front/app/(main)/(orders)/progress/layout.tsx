"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import Logo from "@/components/header/logo"
import HeaderMenu from "@/components/headerMenu"

import Customize from "../components/progress/customize"
import DoneOrders from "../components/progress/doneOrders"

const HistoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="flex flex-none items-center border-b px-4 py-3 ">
        <div className="flex w-auto flex-none items-center space-x-2">
          <HeaderMenu />
          <Logo />
        </div>
        <div className="flex flex-auto items-center pl-4 overflow-hidden gap-1">
          <div className="flex-auto overflow-hidden">
            <DoneOrders />
          </div>
          <Customize />
        </div>
      </header>

      <div className="flex-auto overflow-hidden">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    </>
  )
}

export default HistoryLayout
