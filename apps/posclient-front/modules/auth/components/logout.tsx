import { gql, useMutation } from "@apollo/client"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import queries from "../graphql/queries"
import { onError } from '@/components/ui/use-toast'

const Logout = () => {
  const [logout, { loading }] = useMutation(
    gql`
      mutation {
        posLogout
      }
    `,
    {
      onError({ message }) {
        onError(message)
      },
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
