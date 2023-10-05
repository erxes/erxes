"use client"

import Link from "next/link"
import { queries } from "@/modules/auth/graphql"
import { useQuery } from "@apollo/client"

import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"

const Welcome = () => {
  const { data, loading } = useQuery(queries.uiOptions)
  const { uiOptions } = data?.currentConfig || {}

  if (loading) return <Loader className="h-screen" />

  return (
    <Link href={"/choose-type"} className="h-screen relative block">
      <Image
        src={uiOptions?.bgImage || "/background.png"}
        alt=""
        quality={100}
        sizes="100vw"
        className="object-cover"
      />
    </Link>
  )
}

export default Welcome
