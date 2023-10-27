import "@/styles/globals.css"
import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import { Sidebar } from "@/modules/sidebar/component/Sidebar"

interface ILayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: ILayoutProps) {
  return (
    <Configs>
      <CheckAuth>
        <div className="relative flex h-screen flex-col">
          <>
            <section className="flex flex-auto items-stretch bg-white">
              <Sidebar />
              {children}
            </section>
          </>
        </div>
      </CheckAuth>
    </Configs>
  )
}
