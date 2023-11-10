import { mutations } from "@/common/team/graphql"
import { gql, useMutation } from "@apollo/client"

const useMutations = () => {
  const [usersEditProfileMutation, { loading }] = useMutation(
    gql(mutations.usersEditProfile)
  )

  const usersEditProfile = (newVariables: any) => {
    usersEditProfileMutation({
      variables: { ...newVariables },
    }).catch((e) => console.log(e))
  }

  return {
    usersEditProfile,
    loading,
  }
}

export default useMutations
