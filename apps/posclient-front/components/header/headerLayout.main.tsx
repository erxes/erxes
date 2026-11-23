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
  <header className="sticky top-0 z-30 flex h-14 flex-none items-center gap-1 border-b bg-background/80 px-2 backdrop-blur-md md:px-4 print:hidden">
    <HeaderMenu />
    <Logo />
    {!!children && (
      <>
        <span className="mx-1.5 h-5 w-px flex-none bg-border" />
        <div className="flex min-w-0 items-center">{children}</div>
      </>
    )}
    {!hideUser && (
      <div className="ml-auto flex min-w-0 items-center pl-2">
        <HeaderUser />
      </div>
    )}
  </header>
)

export default HeaderLayout
