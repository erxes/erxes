import "@/styles/globals.css"
import ExmProvider from "@/modules/ExmProvider"
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
        <ExmProvider>
          <div className="relative flex h-screen flex-col">
            <>
              <section className="flex flex-auto items-stretch bg-white">
                <Sidebar />
                {children}
              </section>
            </>
          </div>
        </ExmProvider>
      </CheckAuth>
    </Configs>
  )
}
