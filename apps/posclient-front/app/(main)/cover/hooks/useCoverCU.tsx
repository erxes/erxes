import { useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client"

import { onError } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useCoverCU = () => {
  const id = useSearchParams().get("id")

  const [createCover, { loading }] = useMutation(mutations.coversAdd, {
    onError({ message }) {
      onError(message)
    },
    refetchQueries: ["Covers"],
  })

  const [editCover, { loading: loadingEdit }] = useMutation(
    mutations.coversEdit,
    {
      onError({ message }) {
        onError(message)
      },
      refetchQueries: ["Covers", "CoverDetail"],
    }
  )

  const coverCU = id && id !== "create" ? editCover : createCover

  return { coverCU, loading: loading || loadingEdit }
}

export default useCoverCU
