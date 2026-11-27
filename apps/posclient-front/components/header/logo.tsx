"use client"

import { usePathname, useRouter } from "next/navigation"
import { resetAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtomValue, useSetAtom } from "jotai"

import Image from "@/components/ui/image"
import { useSidebarVisible } from "@/components/sidebar/appSidebar"

const Logo = () => {
  const pathname = usePathname()
  const router = useRouter()
  const reset = useSetAtom(resetAtom)
  const config = useAtomValue(configAtom)

  const sidebarVisible = useSidebarVisible()
  const { logo } = config?.uiOptions || {}

  if (sidebarVisible) return null

  return (
    <div className="mx-1 block flex-none">
      <div
        className="flex h-8 cursor-pointer items-center rounded-md px-1.5 text-foreground transition-colors hover:bg-accent"
        onClick={() => (pathname === "/" ? reset() : router.push("/"))}
      >
        <Image
          alt="logo"
          src={logo || "/logo-dark.png"}
          fallBack="/logo-dark.png"
          height={24}
          width={48}
          className="h-6 w-auto min-w-[4.5rem] object-contain"
          priority
        />
      </div>
    </div>
  )
}

export default Logo
