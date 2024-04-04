import { gql, useMutation } from "@apollo/client"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
      refetchQueries: [queries.currentUser],
    }
  )
  return (
    <Button
      onClick={() => logout()}
      loading={loading}
      variant="ghost"
      className="w-full justify-start"
    >
      <LogOutIcon className="mr-2 h-5 w-5" aria-hidden="true" />
      Гарах
    </Button>
  )
}

export default Logout
