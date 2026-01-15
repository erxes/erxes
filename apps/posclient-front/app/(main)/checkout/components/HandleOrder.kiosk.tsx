import dynamic from "next/dynamic"
import Link from "next/link"
import { checkoutDialogOpenAtom, checkoutModalViewAtom } from "@/store"
import { useAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import SuccessDialog from "./successDialog"

const BillType: any = dynamic(
  () => import("@/modules/checkout/components/ebarimt/billType.kiosk")
)

const RegisterNumber: any = dynamic(
  () => import("@/modules/checkout/components/ebarimt/registerNumber.kiosk")
)

const SelectPaymentType: any = dynamic(
  () =>
    import("@/modules/checkout/components/paymentType/selectPaymentType.kiosk")
)

const HandleOrder = () => {
  const [view, setView] = useAtom(checkoutModalViewAtom)
  const [open, setOpen] = useAtom(checkoutDialogOpenAtom)

  return (
    <>
      <Button variant="outline" size="lg" Component={Link} href="/home">
        Өөрчлөх
      </Button>
      <Dialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
        <DialogTrigger asChild>
          <Button size="lg" onClick={() => setView("billType")}>
            Зөв байна
          </Button>
        </DialogTrigger>

        {view === "billType" && <BillType />}
        {view === "registerNumber" && <RegisterNumber />}
        {view === "choosePay" && <SelectPaymentType />}
      </Dialog>
      <SuccessDialog />
    </>
  )
}

export default HandleOrder
