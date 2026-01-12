import ActiveOrders from "@/modules/orders/ActiveOrders"
import Search from "@/modules/products/components/search/search.market"
import { userLabelAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import HeaderMenu from "../headerMenu"
import Logo from "./logo"

const Header = () => {
  const label = useAtomValue(userLabelAtom)
  return (
    <header className="flex flex-none items-center border-b px-5 py-1.5 print:hidden">
      <div className="pr-2 flex-auto xl:flex-none xl:w-2/3 sm:pr-4">
        <Search />
      </div>
      <div className="flex w-auto items-center justify-end flex-none xl:flex-auto">
        <p className="hidden flex-none text-center text-black/60 sm:block px-2">
          {label}
        </p>
        <ActiveOrders />
        <Logo />
        <HeaderMenu />
      </div>
    </header>
  )
}

export default Header
