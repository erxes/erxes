import { mutations } from "@/common/team/graphql"
import { gql, useMutation } from "@apollo/client"

import { toast } from "@/components/ui/use-toast"

const useMutations = () => {
  const [usersEditProfileMutation, { loading }] = useMutation(
    gql(mutations.usersEditProfile)
  )

  const usersEditProfile = (newVariables: any) => {
    usersEditProfileMutation({
      variables: { ...newVariables },
    })
      .then(() =>
        toast({
          description: "Looking good!",
        })
      )
      .catch((e) =>
        toast({
          description: e.message,
        })
      )
  }

  return {
    usersEditProfile,
    loading,
  }
}

export default useMutations
