import "@/styles/globals.css"
import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Timeclock',
  description: 'Employee Experience Management - Timeclock',
}

interface ILayoutProps {
  children: React.ReactNode
}

export default function TimeclockLayout({ children }: ILayoutProps) {
  return (
    <Configs>
      <CheckAuth>
        <div className="relative flex h-screen w-screen flex-col">
          <>
            <section className="flex flex-auto items-stretch bg-[#F8F9FA]">
              {children}
            </section>
          </>
        </div>
      </CheckAuth>
    </Configs>
  )
}
