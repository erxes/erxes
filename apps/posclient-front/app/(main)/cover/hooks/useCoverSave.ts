import { useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client"
import { useStore } from "jotai"
import useUser from "@/modules/auth/hooks/useUser"
import {
  isCoverAmountsFetchedAtom,
  activeCoverIdAtom,
  coverStatusAtom,
  beginDateAtom,
  endDateAtom,
  descriptionAtom,
  calcAmountsAtom,
  detailsAtom,
  currentAmountsAtom,
  cashAtom,
  calcCashAtom,
  currentCashTotalAtom,
} from "@/store/cover.store"
import { paymentTypesAtom } from "@/store/config.store"
import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import { Cover, Detail } from "@/types/cover.types"
import { mutations } from "../graphql"

export const useCoverSave = () => {
  const id = useSearchParams().get("id")
  const { userId } = useUser()
  const store = useStore()
  const [edit, { loading }] = useMutation<{
    coversEdit: Pick<Cover, "_id" | "status"> & { details: Detail[] }
  }>(mutations.coversEdit, {
    update: (cache) => {
      cache.evict({ id: "ROOT_QUERY", fieldName: "covers" })
    },
  })

  const saveCover = async (): Promise<string> => {
    if (!id || id === "create")
      throw new Error("Хаалт үүсгэж дуусахыг хүлээнэ үү")
    if (!store.get(isCoverAmountsFetchedAtom))
      throw new Error("Эхлээд хаалтын дүн татна уу")
    const cash = store.get(cashAtom)
    const calcCash = store.get(calcCashAtom)
    const amounts = store.get(currentAmountsAtom)
    const calcAmounts = store.get(calcAmountsAtom)
    const savedDetails = store.get(detailsAtom)
    const bankTypes = (store.get(paymentTypesAtom) || [])
      .filter((payment) => ALL_BANK_CARD_TYPES.includes(payment.type))
      .map((payment) => payment.type)
    const details: Detail[] = []
    if (calcCash || store.get(currentCashTotalAtom)) {
      details.push({
        ...cash,
        _id: String(cash._id),
        paidSummary: cash.paidSummary.filter((item) => (item.value || 0) > 0),
        paidDetail: calcCash,
      })
    }
    const paidTypes = new Set([
      ...Object.keys(amounts),
      ...bankTypes,
      ...savedDetails
        .filter((detail) => detail.terminalResults?.length)
        .map((detail) => detail.paidType),
    ])
    paidTypes.forEach((paidType) => {
      const amount = amounts[paidType] || 0
      if (
        amount ||
        bankTypes.includes(paidType) ||
        savedDetails.some(
          (detail) =>
            detail.paidType === paidType && detail.terminalResults?.length
        )
      )
        details.push({
          _id:
            savedDetails.find((detail) => detail.paidType === paidType)?._id ||
            crypto.randomUUID(),
          paidType,
          paidSummary: [
            {
              _id: crypto.randomUUID(),
              kindOfVal: 1,
              kind: "1",
              amount,
              value: amount,
            },
          ],
          paidDetail: calcAmounts?.[paidType],
        })
    })
    const result = await edit({
      variables: {
        id,
        status: "new",
        userId,
        description: store.get(descriptionAtom),
        beginDate: store.get(beginDateAtom),
        endDate: store.get(endDateAtom),
        details,
      },
    })
    if (!result.data?.coversEdit?._id) throw new Error("Хаалт хадгалагдсангүй")
    if (store.get(activeCoverIdAtom) === id) {
      store.set(detailsAtom, result.data.coversEdit.details)
      store.set(coverStatusAtom, result.data.coversEdit.status)
    }
    return result.data.coversEdit._id
  }
  return { saveCover, loading }
}
