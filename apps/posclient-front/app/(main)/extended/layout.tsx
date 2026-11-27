import { ReactNode } from "react"

import HeaderLayout from "@/components/header/headerLayout"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderLayout hideUser />
      {children}
    </>
  )
}

export default Layout
