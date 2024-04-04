"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { queries } from "@/modules/auth/graphql"
import { orderTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"
import { ArrowLeft, PhoneIcon, ShoppingBagIcon, SoupIcon } from "lucide-react"

import { IOrderType } from "@/types/order.types"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"

// colors: IConfigColors;
// logo: string;
// bgImage: string;
// favIcon: string;
// receiptIcon: string;
// kioskHeaderImage: string;
// mobileAppImage: string;
// qrCodeImage: string;
// texts: IConfigColors;

const Page = () => {
  const setType = useSetAtom(orderTypeAtom)
  const router = useRouter()

  const handleClick = (type: IOrderType) => {
    setType(type)
    router.push("/home")
  }
  const { data, loading } = useQuery(queries.uiOptions)
  const { texts, logo } = data?.currentConfig?.uiOptions || {}

  if (loading) return <Loader className="h-screen" />

  return (
    <div className="w-full h-screen flex flex-col items-center justify-between relative ">
      <Button
        className="absolute top-6 right-6 rounded-full px-6 uppercase text-sm"
        size="lg"
        Component={Link}
        href={"/"}
      >
        <ArrowLeft className="h-5 w-5 -translate-x-2" strokeWidth={2} />
        Буцах
      </Button>
      <div />
      <div className="w-full flex flex-col items-center justify-center gap-20">
        <div className="w-4/12 text-center">
          <AspectRatio ratio={1.6}>
            <Image
              src={logo || "/logo-dark.png"}
              alt=""
              className="object-contain p-3"
              sizes={"100vw"}
              quality={100}
            />
          </AspectRatio>
        </div>
        <div className="w-8/12 grid grid-cols-2 gap-4">
          <Button
            className="h-full w-full flex-col py-8 px-6 rounded-3xl uppercase bg-primary/90"
            // variant={"outlne"}
            onClick={() => handleClick("eat")}
            size="lg"
          >
            <AspectRatio className="mx-5">
              <SoupIcon className="h-full w-full" strokeWidth={1} />
            </AspectRatio>
            Зааланд
          </Button>
          {/* <AspectRatio> */}
          <Button
            className="h-full w-full flex-col py-8 px-6 border-4 rounded-3xl uppercase text-primary/80 hover:text-primary  hover:bg-primary/5 hover:border-primary"
            variant={"outline"}
            size="lg"
            onClick={() => handleClick("take")}
          >
            <AspectRatio className="mx-5">
              <ShoppingBagIcon className="h-full w-full" strokeWidth={1} />
            </AspectRatio>
            Авч явах
          </Button>
          {/* </AspectRatio> */}
        </div>
      </div>
      <div className="flex justify-between items-center text-xs uppercase p-6 w-full text-primary font-bold">
        {!!texts?.phone && (
          <span className="flex items-center gap-1">
            <PhoneIcon strokeWidth={2.5} className="w-4 h-4" />
            {texts?.phone}
          </span>
        )}
        <span>{texts?.website}</span>
      </div>
    </div>
  )
}

export default Page
