import ActiveOrders from "@/modules/orders/ActiveOrders"
import { orderNumberAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import HeaderMenu from "../headerMenu"
import Logo from "./logo"

const Header = () => {
  return (
    <div className="flex flex-none items-center gap-4">
      <HeaderMenu />
      <Logo />
      {/* <OrderNumber /> */}
      <ActiveOrders />
    </div>
  )
}
const OrderNumber = () => {
  const orderNumber = useAtomValue(orderNumberAtom)
  if (!orderNumber) return null
  return <div className="ml-auto font-bold">#{orderNumber}</div>
}

export default Header
