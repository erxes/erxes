import Image from "next/image"
import {
  orderNumberAtom,
  orderUserAtom,
  paidDateAtom,
} from "@/store/order.store"
import { format } from "date-fns"
import { useAtom } from "jotai"
import { ebarimtConfigAtom } from "@/store/config.store"

const EbarimtHeader = () => {
  const [user] = useAtom(orderUserAtom)
  const [number] = useAtom(orderNumberAtom)
  const [paidDate] = useAtom(paidDateAtom)
  const [ebarimtConfig] = useAtom(ebarimtConfigAtom)

  const renderUser = () => {
    if (!user?.firstName) return
    return (
      <div>
        <div>Ажилтан: </div>
        <span>
          {user.firstName} {user.lastName}
        </span>
      </div>
    )
  }
  return (
    <>
      <header className="flex items-center justify-center">
        <Image
          src="/erxes-logo.png"
          alt=""
          height={32}
          width={100}
          className="h-8 w-auto object-contain"
        />
        <p className="pl-2 font-bold leading-5">{ebarimtConfig?.name}</p>
      </header>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="w-10 font-semibold">Огноо:</p>
          <p>{!!paidDate && format(new Date(paidDate), "yyyy.MM.dd HH:mm")}</p>
        </div>

        <div className="font-medium">
          {" "}
          &#8470;{":"} {number.split("_")[1]}
        </div>
      </div>

      {renderUser()}
    </>
  )
}

export default EbarimtHeader
