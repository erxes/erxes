import { customerAtom, customerTypeAtom } from "@/store/order.store"
import { useAtom } from "jotai"
import { Building2Icon, UserCheckIcon, UserCircleIcon } from "lucide-react"

const CustomerType = ({
  className,
  readOnly,
}: {
  className: string
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
    <div onClick={handleClick}>
      {type === "" && <UserCircleIcon className={className} />}
      {type === "company" && <Building2Icon className={className} />}
      {type === "user" && <UserCheckIcon className={className} />}
    </div>
  )
}

export default CustomerType
