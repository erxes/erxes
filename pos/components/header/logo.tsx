"use client"

import { usePathname, useRouter } from "next/navigation"
import { configAtom } from "@/store/config.store"
import { setInitialAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import Image from "@/components/ui/image"

const Logo = () => {
  const pathname = usePathname()
  const router = useRouter()
  const setInitialState = useSetAtom(setInitialAtom)
  const config = useAtomValue(configAtom)

  const { logo } = config?.uiOptions || {}

  return (
    <div className="hidden rounded-md bg-gray-100 p-1 sm:block">
      <div
        className="rounded bg-white px-3 py-1 text-black"
        onClick={() =>
          pathname === "/" ? setInitialState() : router.push("/")
        }
      >
        <Image
          alt="logo"
          src={logo || "/logo-dark.png"}
          fallBack="/logo-dark.png"
          height={24}
          width={48}
          className="object-contain"
        />
      </div>
    </div>
  )
}

export default Logo
