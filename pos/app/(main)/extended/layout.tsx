import { ReactNode } from "react"

import HeaderLayout from "@/components/header/headerLayout"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HeaderLayout hideUser>
        <span className='w-2/3'/>
      </HeaderLayout>
      {children}
    </>
  )
}

export default Layout
