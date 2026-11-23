import { useMutation } from "@apollo/client"
import { Loader2Icon, LogOutIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { onError } from "@/components/ui/use-toast"
import { headerMenuItemClass } from "@/components/headerMenu/headerMenuItemClass"

import mutations from "../graphql/mutations"
import queries from "../graphql/queries"

const Logout = () => {
  const [logout, { loading }] = useMutation(mutations.logout, {
    onError({ message }) {
      onError(message)
    },
    refetchQueries: [queries.posCurrentUser],
  })
  return (
    <DropdownMenuItem
      disabled={loading}
      onSelect={() => logout()}
      className={headerMenuItemClass}
    >
      {loading ? (
        <Loader2Icon className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOutIcon aria-hidden="true" />
      )}
      Гарах
    </DropdownMenuItem>
  )
}

export default Logout
