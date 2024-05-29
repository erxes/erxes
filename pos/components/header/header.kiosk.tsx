"use client"

import { useRouter } from "next/navigation"
import { queries } from "@/modules/auth/graphql"
import { setInitialAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import Image from "@/components/ui/image"

import { AspectRatio } from "../ui/aspect-ratio"
import Loader from "../ui/loader"
import { useToast } from "../ui/use-toast"

const Header = () => {
  const { onError } = useToast()
  const router = useRouter()
  const { data, loading } = useQuery(queries.kioskHomeHeader, {
    onError,
  })
  const setInitialState = useSetAtom(setInitialAtom)
  const { uiOptions } = data?.currentConfig || {}

  const reset = () => {
    setInitialState()
    router.push("/")
  }

  if (loading)
    return (
      <AspectRatio ratio={4} className="flex items-center justify-center">
        <Loader className="flex-none" />
      </AspectRatio>
    )

  return (
    <div className="grid grid-cols-4 shadow-lg shadow-stone-200 flex-none">
      <AspectRatio ratio={1}>
        <Image
          src={uiOptions?.logo || "/logo-dark.png"}
          alt=""
          className="object-contain p-3"
          sizes={"25vw"}
          onClick={reset}
        />
      </AspectRatio>
      <div className="col-span-3 rounded-bl-3xl overflow-hidden">
        <AspectRatio ratio={3 / 1}>
          <Image
            src={uiOptions?.kioskHeaderImage}
            alt=""
            quality={100}
            className="object-cover"
            sizes={"75vw"}
          />
        </AspectRatio>
      </div>
    </div>
  )
}

export default Header
