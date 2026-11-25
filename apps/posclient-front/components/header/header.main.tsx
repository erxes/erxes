import ActiveOrders from "@/modules/orders/ActiveOrders.main"
import OrderNotf from "@/modules/orders/orderNotf"
import { ShoppingCartIcon } from "lucide-react"

import HeaderMenu from "../headerMenu"
import HeaderTitle from "./headerTitle"
import HeaderUser from "./headerUser"
import Logo from "./logo"

const Header = () => (
  <header className="flex h-10 flex-none items-center gap-1 border-b bg-background px-2">
    <div className="flex flex-none items-center">
      <HeaderMenu />
      <Logo />
      <HeaderTitle icon={ShoppingCartIcon}>Борлуулалт</HeaderTitle>
    </div>
    <span className="mx-1.5 h-4 w-px flex-none bg-border" />
    <div className="flex min-w-0 flex-auto items-center gap-2 overflow-hidden">
      <ActiveOrders />
      <OrderNotf />
    </div>
    <HeaderUser />
  </header>
)

export default Header
