import ActiveOrders from "@/modules/orders/ActiveOrders.main"

import HeaderMenu from "../headerMenu"
import Logo from "./logo"

const Header = () => {
  return (
    <header className="flex flex-none items-center border-b px-4  py-1.5">
      <div className="flex w-auto flex-none items-center">
        <HeaderMenu />
        <div className="px-1" />
        <Logo />
      </div>
      <div className="flex flex-auto items-center overflow-hidden pl-4">
        <ActiveOrders />
      </div>
    </header>
  )
}

export default Header
