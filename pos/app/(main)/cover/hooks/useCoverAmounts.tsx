import { useSearchParams } from "next/navigation"
import {
  isCoverAmountsFetchedAtom,
  setCoverAmountAtom,
} from "@/store/cover.store"
import { useLazyQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import { queries } from "../graphql"

const useCoverAmounts = () => {
  const { onError } = useToast()
  const setCoverAmount = useSetAtom(setCoverAmountAtom)
  const changeIsFetched = useSetAtom(isCoverAmountsFetchedAtom)
  const id = useSearchParams().get("id")

  const [getCoverAmounts, { loading }] = useLazyQuery(queries.coverAmounts, {
    onCompleted(data) {
      if (id === "create") {
        setCoverAmount(data.coverAmounts || {})
        changeIsFetched(true)
      }
    },
    onError,
  })

  return { getCoverAmounts, loading }
}

export default useCoverAmounts
