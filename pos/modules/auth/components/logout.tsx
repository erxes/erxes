import { gql, useMutation } from "@apollo/client"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

import queries from "../graphql/queries"

const Logout = () => {
  const { onError } = useToast()
  const [logout, { loading }] = useMutation(
    gql`
      mutation {
        posLogout
      }
    `,
    {
      onError,
      refetchQueries: [queries.posCurrentUser],
    }
  )
  return (
    <DropdownMenuItem asChild onClick={() => logout()}>
      <Button
        loading={loading}
        variant="ghost"
        className="w-full justify-start mt-1"
      >
        <LogOutIcon className="mr-2 h-5 w-5" aria-hidden="true" />
        Гарах
      </Button>
    </DropdownMenuItem>
  )
}

export default Logout
