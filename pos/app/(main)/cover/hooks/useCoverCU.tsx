import { useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useCoverCU = () => {
  const id = useSearchParams().get("id")
  const { onError } = useToast()

  const [createCover, { loading }] = useMutation(mutations.coversAdd, {
    onError,
    refetchQueries: ["Covers"],
  })

  const [editCover, { loading: loadingEdit }] = useMutation(
    mutations.coversEdit,
    {
      onError,
      refetchQueries: ["Covers", "CoverDetail"],
    }
  )

  const coverCU = id && id !== "create" ? editCover : createCover

  return { coverCU, loading: loading || loadingEdit }
}

export default useCoverCU
