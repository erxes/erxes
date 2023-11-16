import { mutations } from "@/common/team/graphql"
import { gql, useMutation } from "@apollo/client"

import { toast } from "@/components/ui/use-toast"

const useMutations = () => {
  const [usersEditProfileMutation, { loading }] = useMutation(
    gql(mutations.usersEditProfile)
  )

  const [changePasswordMutation, { loading: changePasswordLoading }] =
    useMutation(gql(mutations.changePassword))

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

  const changePassword = ({
    currentPassword,
    newPassword,
    confirmation,
  }: {
    currentPassword: string
    newPassword: string
    confirmation: string
  }) => {
    if (newPassword !== confirmation) {
      toast({
        description: "Password didn't match",
      })
    }

    if (!currentPassword || currentPassword.length === 0) {
      toast({
        description: "Please enter a current password",
      })
    }

    if (!newPassword || newPassword.length === 0) {
      toast({
        description: "Please enter a new password",
      })
    }

    changePasswordMutation({ variables: { currentPassword, newPassword } })
      .then(() => {
        toast({
          description: "Your password has been changed and updated",
        })
      })
      .catch((error) => {
        toast({
          description: error.message,
        })
      })
  }

  return {
    usersEditProfile,
    changePassword,
    changePasswordLoading,
    loading,
  }
}

export default useMutations
