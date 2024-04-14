import "@/styles/globals.css"
import ExmProvider from "@/modules/ExmProvider"
import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import TopNavbar from "@/modules/navbar/component/TopNavbar"
import Sidebar from "@/modules/sidebar/component/Sidebar"

import Image from "@/components/ui/image"

interface ILayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: ILayoutProps) {
  return (
    <Configs>
      <CheckAuth>
        <ExmProvider>
          <div className="flex h-screen">
            <div className="w-[230px] border-r">
              <div className="w-full h-[67px] flex items-center justify-center relative border-b">
                <Image alt="dark" src="/logo-dark.svg" fill priority />
              </div>

              <Sidebar />
            </div>

            <div className="flex-1 relative overflow-auto">
              <TopNavbar />

              <div className="pt-[67px]">
                <div className="p-4">{children}</div>
              </div>
            </div>
          </div>
        </ExmProvider>
      </CheckAuth>
    </Configs>
  )
}
