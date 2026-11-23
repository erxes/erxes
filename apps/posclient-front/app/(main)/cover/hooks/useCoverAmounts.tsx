import { useSearchParams } from "next/navigation"
import {
  isCoverAmountsFetchedAtom,
  setCoverAmountAtom,
} from "@/store/cover.store"
import { useLazyQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { onError, toast } from "@/components/ui/use-toast"

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
      const amounts = data.coverAmounts || {}
      setCoverAmount(amounts)
      changeIsFetched(true)
      const total = Object.entries(amounts)
        .filter(([key]) => key !== "startDate" && key !== "endDate")
        .reduce<number>((sum, [, amount]) => sum + (Number(amount) || 0), 0)
      saveCover()
        .then(() =>
          toast({
            title: "Хаалтын дүн татагдлаа",
            description: `Системийн нийт дүн: ${total.toLocaleString()}₮`,
            variant: "success",
          })
        )
        .catch((error: unknown) =>
          onError(error instanceof Error ? error.message : String(error))
        )
    },
    onError({ message }) {
      onError(message)
    },
  })

  return { getCoverAmounts, loading }
}
