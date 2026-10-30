import { useSearchParams } from "next/navigation"
import {
  isCoverAmountsFetchedAtom,
  setCoverAmountAtom,
} from "@/store/cover.store"
import { useLazyQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { onError } from "@/components/ui/use-toast"

import { queries } from "../graphql"
import { useCoverSave } from "./useCoverSave"

export const useCoverAmounts = () => {
  const { saveCover } = useCoverSave()
  const setCoverAmount = useSetAtom(setCoverAmountAtom)
  const changeIsFetched = useSetAtom(isCoverAmountsFetchedAtom)
  const id = useSearchParams().get("id")

  const [getCoverAmounts, { loading }] = useLazyQuery(queries.coverAmounts, {
    variables: { id: id === "create" ? undefined : id },
    onCompleted(data) {
      setCoverAmount(data.coverAmounts || {})
      changeIsFetched(true)
      void saveCover().catch((error: unknown) =>
        onError(error instanceof Error ? error.message : String(error))
      )
    },
    onError({ message }) {
      onError(message)
    },
  })

  return { getCoverAmounts, loading }
}
