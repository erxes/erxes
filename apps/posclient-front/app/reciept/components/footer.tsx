import { ebarimtConfigAtom } from "@/store/config.store"
import { descriptionAtom, printTypeAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

const Footer = () => {
  const type = useAtomValue(printTypeAtom)
  const { footerText } = useAtomValue(ebarimtConfigAtom) || {}
  const description = useAtomValue(descriptionAtom)

  if (type === "inner") {
    return null
  }

  return (
    <>
      {!!description && (
        <div className="receipt-print__section text-[11px]">
          <span className="font-semibold">Тайлбар:</span> {description}
        </div>
      )}
      {!!footerText && (
        <div
          className="receipt-print__section text-[11px] whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: footerText }}
        />
      )}
    </>
  )
}

export default Footer
