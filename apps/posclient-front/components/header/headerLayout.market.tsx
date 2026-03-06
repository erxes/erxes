import { userLabelAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import HeaderMenu from "@/components/headerMenu"

import Logo from "./logo"

const HeaderLayout = ({
  children,
  hideUser,
}: {
  children?: React.ReactNode
  hideUser?: boolean
}) => {
  const label = useAtomValue(userLabelAtom)
  return (
    <header className="flex flex-none items-center border-b px-5 py-1.5 print:hidden">
      <div className="pr-2 flex-auto xl:flex-none xl:w-2/3 sm:pr-4">
        {children}
      </div>
      <div className="flex w-auto items-center justify-end flex-none xl:flex-auto">
        {!hideUser && (
          <p className="hidden flex-none text-center text-black/60 sm:block px-2">
            {label}
          </p>
        )}
        <Logo />
        <HeaderMenu />
      </div>
    </header>
  )
}

export default HeaderLayout
