import { LucideIcon } from "lucide-react"

export const RecordTableInlineHead = (props: {
  icon?: LucideIcon
  label: string
}) => {
  return (
    <div className="flex items-center gap-1">
      {props.icon && <props.icon aria-hidden="true" className="size-4" />}
      {props.label}
    </div>
  )
}
