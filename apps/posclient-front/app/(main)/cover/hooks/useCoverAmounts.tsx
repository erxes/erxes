import { useSearchParams } from "next/navigation"
import {
  isCoverAmountsFetchedAtom,
  setCoverAmountAtom,
} from "@/store/cover.store"
import { useLazyQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { onError } from "@/components/ui/use-toast"

import { queries } from "../graphql"

const useCoverAmounts = () => {
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
    onError({ message }) {
      onError(message)
    },
  })

  return { getCoverAmounts, loading }
}

export default useCoverAmounts
