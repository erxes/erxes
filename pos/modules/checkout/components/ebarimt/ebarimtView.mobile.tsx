import { useRouter } from "next/navigation"
import { checkoutDialogOpenAtom, checkoutModalViewAtom } from "@/store"
import { activeOrderIdAtom, setInitialAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"
import { CheckIcon } from "lucide-react"

import useTab from "@/lib/useTab"
import { Button } from "@/components/ui/button"

const EbarimtView = () => {
  const _id = useAtomValue(activeOrderIdAtom)
  const setInitial = useSetAtom(setInitialAtom)
  const router = useRouter()
  const setOpen = useSetAtom(checkoutDialogOpenAtom)
  const setView = useSetAtom(checkoutModalViewAtom)
  const { openNewWindow } = useTab()

  return (
    <div className="aspect-square md:h-[50vh] md:aspect-auto text-center">
      <div className="h-16 w-16 rounded-full bg-primary/20 inline-flex items-center justify-center mb-6 mt-16">
        <CheckIcon
          className="h-8 w-8 -mb-2 text-primary animate-bounce"
          strokeWidth={3}
        />
      </div>
      <div className="font-semibold text-lg text-center text-primary">
        Баримт хэвлэгдлээ
      </div>
      <div className="space-y-2 mx-auto inline-block">
        <Button
          className="mt-6 px-16 font-medium flex min-w-full"
          size="lg"
          onClick={() => {
            setInitial()
            setOpen(false)
            router.push("/")
            setView("")
          }}
        >
          Дуусгах
        </Button>
        <Button
          className="mt-6 px-16 font-medium flex  min-w-full"
          size="lg"
          onClick={() => openNewWindow("/reciept/ebarimt?id=" + _id)}
          variant="secondary"
        >
          Дахин хэвлэх
        </Button>
      </div>
    </div>
  )
}

export default EbarimtView
