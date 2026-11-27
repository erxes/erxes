import Link from "next/link"
import mutations from "@/modules/auth/graphql/mutations"
import queries from "@/modules/auth/graphql/queries"
import { currentUserAtom } from "@/store/config.store"
import { useMutation } from "@apollo/client"
import { IconLoader2, IconLogout, IconSettings } from "@tabler/icons-react"
import { useAtomValue } from "jotai"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { onError } from "@/components/ui/use-toast"

const getInitials = (value?: string) =>
  (value || "")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const itemClass =
  "flex h-7 cursor-pointer items-center gap-2 rounded-sm px-2 text-[13px] font-medium outline-hidden focus:bg-accent [&>svg]:size-4 [&>svg]:shrink-0"

const HeaderUser = () => {
  const { details, email } = useAtomValue(currentUserAtom) || {}
  const name = details?.fullName || email
  const subtitle = details?.position || (details?.fullName ? email : "")

  const [logout, { loading }] = useMutation(mutations.logout, {
    onError({ message }) {
      onError(message)
    },
    refetchQueries: [queries.posCurrentUser],
  })

  if (!name) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Хэрэглэгчийн цэс"
          className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 outline-hidden transition-colors hover:bg-accent focus-visible:shadow-focus data-[state=open]:bg-accent"
        >
          <span className="flex size-7 flex-none items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {getInitials(name)}
          </span>
          <span className="hidden min-w-0 text-left leading-tight md:block">
            <span className="block max-w-48 truncate text-[13px] font-medium">
              {name}
            </span>
            {!!subtitle && (
              <span className="block max-w-48 truncate text-xs text-muted-foreground">
                {subtitle}
              </span>
            )}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-56 p-1">
        <DropdownMenuLabel className="px-2 py-1.5">
          <span className="block truncate text-[13px] font-medium">{name}</span>
          {!!email && email !== name && (
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="-mx-1 my-1" />
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/settings">
            <IconSettings className="text-muted-foreground" />
            Тохиргоо
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={itemClass}
          disabled={loading}
          onSelect={() => logout()}
        >
          {loading ? (
            <IconLoader2 className="animate-spin text-muted-foreground" />
          ) : (
            <IconLogout className="text-muted-foreground" />
          )}
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderUser
