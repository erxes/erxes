import ActiveOrders from "@/modules/orders/ActiveOrders.main"
import OrderNotf from "@/modules/orders/orderNotf"

import HeaderMenu from "../headerMenu"
import Logo from "./logo"

const Header = () => {
  return (
    <header className="flex h-14 flex-none items-center gap-1 border-b bg-background px-3">
      <div className="flex flex-none items-center">
        <HeaderMenu />
        <Logo />
      </div>
      <div className="mx-2 h-6 w-px flex-none bg-border" />
      <div className="flex min-w-0 flex-auto items-center gap-2 overflow-hidden">
        <ActiveOrders />
        <OrderNotf />
      </div>
    </header>
  )
}

export default Header
