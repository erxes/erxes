"use client"

import { configAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import Image from "@/components/ui/image"

const Logo = () => {
  const config = useAtomValue(configAtom)

  const { logo } = config?.uiOptions || {}

  return (
    <Image
      alt="name"
      src={logo || "/logo-dark.png"}
      fallBack={"/logo-dark.png"}
      height={48}
      width={96}
      className="object-contain h-12 w-auto min-w-[6rem]"
    />
  )
}

export default Logo
