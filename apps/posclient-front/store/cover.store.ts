import { atom } from "jotai"

import { Cover, Detail } from "@/types/cover.types"

export const initialCashKinds = [
  {
    kindOfVal: 10,
    value: 0,
  },
  {
    kindOfVal: 20,
    value: 0,
  },
  {
    kindOfVal: 50,
    value: 0,
  },
  {
    kindOfVal: 100,
    value: 0,
  },
  {
    kindOfVal: 500,
    value: 0,
  },
  {
    kindOfVal: 1000,
    value: 0,
  },
  {
    kindOfVal: 5000,
    value: 0,
  },
  {
    kindOfVal: 10000,
    value: 0,
  },
  {
    kindOfVal: 20000,
    value: 0,
  },
]

export const calcCashAtom = atom<number>(0)
export const calcAmountsAtom = atom<null | {
  [key: string]: number
}>(null)
export const beginDateAtom = atom<Date | null>(null)
export const endDateAtom = atom<Date | null>(null)
export const currentAmountsAtom = atom<{ [key: string]: number }>({})
export const detailsAtom = atom<Detail[]>([])
export const isCoverAmountsFetchedAtom = atom<boolean>(false)

const cashInitial = {
  _id: Math.random(),
  paidType: "cashAmount",
  paidSummary: initialCashKinds,
}

export const cashAtom = atom<Detail>(cashInitial)
export const currentCashTotalAtom = atom((get) =>
  (get(cashAtom).paidSummary || []).reduce(
    (total: number, note) => total + note.kindOfVal * (note.value || 0),
    0
  )
)
export const descriptionAtom = atom<string>("")
export const terminalResultsAtom = atom((get) =>
  get(detailsAtom).flatMap((detail) =>
    (detail.terminalResults || []).map((result) => ({
      ...result,
      bank: detail.paidType,
    }))
  )
)
export const terminalFetchBusyAtom = atom(false)
export const coverValidationAttemptedAtom = atom(false)
export const activeCoverIdAtom = atom("")
export const coverStatusAtom = atom<Cover["status"]>("new")

export const setCoverAmountAtom = atom(
  null,
  (get, set, { startDate, cashAmount, endDate, ...rest }) => {
    set(beginDateAtom, startDate)
    if (endDate) set(endDateAtom, endDate)
    set(calcCashAtom, cashAmount || 0)
    set(calcAmountsAtom, rest)
    set(currentAmountsAtom, rest)
  }
)

export const setCoverDetailAtom = atom(
  null,
  (
    get,
    set,
    { beginDate, endDate, details, description, status, _id }: Cover
  ) => {
    set(beginDateAtom, beginDate)
    if (get(activeCoverIdAtom) !== _id) set(coverValidationAttemptedAtom, false)
    set(activeCoverIdAtom, _id)
    set(endDateAtom, endDate)
    const cashData = (details || []).find((d) => d.paidType === "cashAmount")
    const cashDataSyncWithInitial = {
      ...cashInitial,
      ...cashData,
      paidSummary: initialCashKinds.map((item) => ({
        ...item,
        value:
          (cashData?.paidSummary || []).find(
            (paid: { kindOfVal: number }) => paid.kindOfVal === item.kindOfVal
          )?.value || 0,
      })),
    }
    const exceptCash = (details || []).filter(
      (detail) => detail.paidType !== "cashAmount"
    )
    set(cashAtom, cashDataSyncWithInitial)
    set(calcCashAtom, Number(cashData?.paidDetail) || 0)
    set(
      calcAmountsAtom,
      Object.fromEntries(
        exceptCash.map((detail) => [
          detail.paidType,
          Number(detail.paidDetail) || 0,
        ])
      )
    )

    const amounts: { [key: string]: number } = {}
    exceptCash.forEach((detail) => {
      amounts[detail.paidType] = detail.paidSummary[0]?.value || 0
    })
    set(currentAmountsAtom, amounts)
    set(descriptionAtom, description ?? "")
    set(detailsAtom, details || [])
    set(coverStatusAtom, status)
  }
)

export const resetCoverDetailAtom = atom(null, (get, set) => {
  set(activeCoverIdAtom, "")
  set(coverValidationAttemptedAtom, false)
  set(calcCashAtom, 0)
  set(calcAmountsAtom, null)
  set(beginDateAtom, null)
  set(endDateAtom, null)
  set(detailsAtom, [])
  set(isCoverAmountsFetchedAtom, false)
  set(cashAtom, cashInitial)
  set(currentAmountsAtom, {})
  set(descriptionAtom, "")
  set(coverStatusAtom, "new")
})

export const description = atom<string>("")
