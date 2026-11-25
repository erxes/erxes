import "@/styles/globals.css"

import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import { CartAuditSync } from "@/modules/orders/components/CartAuditSync"

import { AppSidebar } from "@/components/sidebar/appSidebar"

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <Configs>
      <CheckAuth>
        <CartAuditSync />
        <div className="flex h-screen">
          <AppSidebar />
          <div className="relative flex min-w-0 flex-1 flex-col">
            {children}
          </div>
        </div>
      </CheckAuth>
    </Configs>
  )
}
