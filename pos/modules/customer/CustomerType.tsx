import { customerAtom, customerTypeAtom } from "@/store/order.store"
import { useAtom } from "jotai"
import { Building2Icon, UserCheckIcon, UserCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const CustomerType = ({
  className,
  readOnly,
}: {
  className?: string
  readOnly?: boolean
}) => {
  const [type, setType] = useAtom(customerTypeAtom)
  const [, setCustomer] = useAtom(customerAtom)

  const handleClick = () => {
    if (readOnly) return null
    setCustomer(null)
    if (type === "company") return setType("user")
    if (type === "user") return setType("")
    return setType("company")
  }

  return (
    <Button onClick={handleClick} variant="outline" className="px-2.5">
      {type === "" && <UserCircleIcon className={className} />}
      {type === "company" && <Building2Icon className={className} />}
      {type === "user" && <UserCheckIcon className={className} />}
    </Button>
  )
}

export default CustomerType
