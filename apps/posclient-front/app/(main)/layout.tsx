import "@/styles/globals.css"

import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import { CartAuditSync } from "@/modules/orders/components/CartAuditSync"

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <Configs>
      <CheckAuth>
        <CartAuditSync />
        <div className="relative flex h-screen flex-col">{children}</div>
      </CheckAuth>
    </Configs>
  )
}
