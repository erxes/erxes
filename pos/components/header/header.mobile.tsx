import { userLabelAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import HeaderMenu from "../headerMenu"

const Header = () => {
  const label = useAtomValue(userLabelAtom)
  return (
    <div className="flex flex-none items-center gap-4">
      <HeaderMenu />
      <div className="font-semibold">{label}</div>
    </div>
  )
}

export default Header
