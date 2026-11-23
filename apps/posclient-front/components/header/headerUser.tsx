import { currentUserAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

const getInitials = (value?: string) =>
  (value || "")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const HeaderUser = () => {
  const { details, email } = useAtomValue(currentUserAtom) || {}
  const name = details?.fullName || email
  const subtitle = details?.position || (details?.fullName ? email : "")

  if (!name) {
    return null
  }

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1">
      <span className="flex size-7 flex-none items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
        {getInitials(name)}
      </span>
      <span className="hidden min-w-0 leading-tight md:block">
        <span className="block max-w-48 truncate text-[13px] font-medium">
          {name}
        </span>
        {!!subtitle && (
          <span className="block max-w-48 truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
    </div>
  )
}

export default HeaderUser
