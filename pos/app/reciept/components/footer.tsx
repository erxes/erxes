import { ebarimtConfigAtom } from "@/store/config.store"
import { descriptionAtom, printTypeAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

const Footer = () => {
  const type = useAtomValue(printTypeAtom)
  const { footerText } = useAtomValue(ebarimtConfigAtom) || {}
  const description = useAtomValue(descriptionAtom)

  if (type === "inner") return null

  return (
    <>
      {!!description && (
        <div className="text-[11px]">Тайлбар: {description}</div>
      )}
      <div className="text-[11px]">{footerText}</div>
    </>
  )
}

export default Footer
