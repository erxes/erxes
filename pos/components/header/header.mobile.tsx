import ActiveOrders from "@/modules/orders/ActiveOrders"

import HeaderMenu from "../headerMenu"
import Logo from "./logo"

const Header = () => {
  return (
    <div className="flex flex-none items-center gap-2">
      <HeaderMenu />
      <Logo />
      <ActiveOrders />
    </div>
  )
}

export default Header
