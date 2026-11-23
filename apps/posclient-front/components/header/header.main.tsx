import ActiveOrders from "@/modules/orders/ActiveOrders.main"
import OrderNotf from "@/modules/orders/orderNotf"
import { configAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import HeaderMenu from "../headerMenu"
import HeaderUser from "./headerUser"
import Logo from "./logo"

const Header = () => {
  const config = useAtomValue(configAtom)
  return (
    <header className="flex h-12 flex-none items-center gap-1 border-b bg-sidebar px-2">
      <div className="flex flex-none items-center">
        <HeaderMenu />
        <Logo />
        {config?.name && (
          <span
            className="hidden max-w-48 truncate px-1 text-[13px] font-medium lg:block"
            title={config.name}
          >
            {config.name}
          </span>
        )}
      </div>
      <span className="mx-2 h-3 w-0.5 flex-none rounded-lg bg-border" />
      <div className="flex min-w-0 flex-auto items-center gap-2 overflow-hidden">
        <ActiveOrders />
        <OrderNotf />
      </div>
      <HeaderUser />
    </header>
  )
}

export default Header
