import { useParams } from "next/navigation"
import { setCoverAmountAtom } from "@/store/cover.store"
import { useLazyQuery } from "@apollo/client"
import { useAtom } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import { queries } from "../graphql"

const useCoverAmounts = () => {
  const { onError } = useToast()
  const [, setCoverAmount] = useAtom(setCoverAmountAtom)
  const params = useParams()
  const { id } = params || {}

  const [getCoverAmounts, { loading }] = useLazyQuery(queries.coverAmounts, {
    onCompleted(data) {
      if (id === "create") {
        setCoverAmount(data.coverAmounts || {})
      }
    },
    onError,
  })

  return { getCoverAmounts, loading }
}

export default useCoverAmounts
