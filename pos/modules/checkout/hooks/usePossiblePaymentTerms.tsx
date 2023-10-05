import useGolomt from "@/modules/checkout/hooks/useGolomt"
import useKhanCard from "@/modules/checkout/hooks/useKhanCard"
import useTDB from "@/modules/checkout/hooks/useTDB"
import { paymentConfigAtom } from "@/store/config.store"
import { unPaidAmountAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { useCheckNotSplit } from "./usePaymentType"

const usePossiblePaymentTerms = () => {
  const config = useAtomValue(paymentConfigAtom)
  const notPaidAmount = useAtomValue(unPaidAmountAtom)
  const { paymentIds } = config || {}
  const { loading: loadingKhan, isAlive: khan } = useKhanCard({
    skipCheck: true,
  })
  const { paymentType: tdb } = useTDB()
  const { isIncluded: golomt } = useGolomt()
  const { mappedPts, paidNotSplit } = useCheckNotSplit()

  const disabledTerms = !!paidNotSplit 

  return {
    loadingKhan,
    disabledTerms,
    paymentIds,
    khan,
    tdb,
    golomt,
    mappedPts,
    notPaidAmount
  }
}

export default usePossiblePaymentTerms
