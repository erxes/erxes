"use client"

import Link from "next/link"
import { uiOptionsAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import Image from "@/components/ui/image"

const Welcome = () => {
  const { bgImage } = useAtomValue(uiOptionsAtom) || {}
  return (
    <Link href={"/choose-type"} className="h-screen relative block">
      <Image
        src={bgImage || "/background.png"}
        alt=""
        quality={100}
        sizes="100vw"
        className="object-cover"
      />
    </Link>
  )
}

export default Welcome
