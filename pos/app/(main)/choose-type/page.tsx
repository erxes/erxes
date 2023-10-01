"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { orderTypeAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"
import { ArrowLeft, ShoppingBagIcon, SoupIcon } from "lucide-react"

import { IOrderType } from "@/types/order.types"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import Image from "@/components/ui/image"

const Page = () => {
  const setType = useSetAtom(orderTypeAtom)
  const router = useRouter()

  const handleClick = (type: IOrderType) => {
    setType(type)
    router.push("/home")
  }

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
              src="https://seeklogo.com/images/Y/yoshinoya-logo-0838D5BF03-seeklogo.com.png"
              alt=""
              className="object-contain p-3"
              sizes={"100vw"}
              quality={100}
            />
          </AspectRatio>
          <div className="text-sm font-bold whitespace-nowrap uppercase text-black/70">
            Эрүүл - амттай - түргэн
          </div>
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
        <span>v.0.0.1</span>
        <span>www.yoshinoyamongolia.mn</span>
      </div>
    </div>
  )
}

export default Page
