import HeaderMenu from "@/components/headerMenu"

import HeaderUser from "./headerUser"
import Logo from "./logo"

const HeaderLayout = ({
  children,
  hideUser,
}: {
  children?: React.ReactNode
  hideUser?: boolean
}) => (
  <header className="sticky top-0 z-30 flex h-10 flex-none items-center gap-1 border-b bg-background/80 px-2 backdrop-blur-md md:px-4 print:hidden">
    <div className="flex min-w-0 flex-auto items-center">{children}</div>
    <div className="flex flex-none items-center gap-1">
      {!hideUser && <HeaderUser />}
      <Logo />
      <HeaderMenu />
    </div>
  </header>
)

export default HeaderLayout
