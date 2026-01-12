"use client"

import { useRouter } from "next/navigation"
import { uiOptionsAtom } from "@/store/config.store"
import { setInitialAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import Image from "@/components/ui/image"

import { AspectRatio } from "../ui/aspect-ratio"

const Header = () => {
  const { logo, kioskHeaderImage } = useAtomValue(uiOptionsAtom) || {}
  const router = useRouter()
  const setInitialState = useSetAtom(setInitialAtom)

  const reset = () => {
    setInitialState()
    router.push("/")
  }

  return (
    <div className="grid grid-cols-4 shadow-lg shadow-stone-200 flex-none">
      <AspectRatio ratio={1}>
        <Image
          src={logo || "/logo-dark.png"}
          alt=""
          className="object-contain p-3"
          sizes={"25vw"}
          onClick={reset}
        />
      </AspectRatio>
      <div className="col-span-3 rounded-bl-3xl overflow-hidden">
        <AspectRatio ratio={3 / 1}>
          {!!kioskHeaderImage && (
            <Image
              src={kioskHeaderImage}
              alt=""
              quality={100}
              className="object-cover"
              sizes={"75vw"}
            />
          )}
        </AspectRatio>
      </div>
    </div>
  )
}

export default Header
