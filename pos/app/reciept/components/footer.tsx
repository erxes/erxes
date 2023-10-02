import { ebarimtConfigAtom } from "@/store/config.store"
import { printTypeAtom } from "@/store/order.store"
import { useAtom } from "jotai"

const Footer = () => {
  const [type] = useAtom(printTypeAtom)
  const [config] = useAtom(ebarimtConfigAtom)
  const { footerText } = config?.ebarimtConfig || {}
  if (type === "inner") return null
  return <div className="text-[11px]">{footerText}</div>
}

export default Footer
