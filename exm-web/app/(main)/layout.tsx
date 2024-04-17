import "@/styles/globals.css"
import ExmProvider from "@/modules/ExmProvider"
import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import { Sidebar } from "@/modules/sidebar/component/Sidebar"

import Image from "@/components/ui/image"

import RightNavbar from "../../modules/navbar/component/RightNavbar"

interface ILayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: ILayoutProps) {
  return (
    <Configs>
      <CheckAuth>
        <ExmProvider>
          <div className="relative flex h-screen flex-col">
            <section className="flex justify-between bg-white border-b border-exm ">
              <div className="flex justify-center w-[230px] h-[67px] items-center border-r border-exm">
                <Image
                  alt=""
                  src="/logo-dark.svg"
                  height={100}
                  width={100}
                  loading="lazy"
                  className="w-25"
                />
              </div>
              <RightNavbar />
            </section>
            <section className="flex flex-auto items-stretch bg-white">
              <Sidebar />
              <div className="bg-[#FAFAFA] w-full">{children}</div>
            </section>
          </div>
        </ExmProvider>
      </CheckAuth>
    </Configs>
  )
}
