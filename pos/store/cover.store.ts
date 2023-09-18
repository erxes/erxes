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

export const setCoverAmountAtom = atom(
  null,
  (get, set, { startDate, cashAmount, endDate, ...rest }) => {
    set(beginDateAtom, startDate)
    set(calcCashAtom, cashAmount || 0)
    set(calcAmountsAtom, rest)
    set(currentAmountsAtom, rest)
  }
)
export const golomtResponseAtom = atom<string>("")
export const tdbResponseAtom = atom<string>("")

// (Object.keys(rest) || []).map((pt) => ({
//   _id: Math.random(),
//   paidType: pt,
//   paidSummary: [
//     {
//       _id: Math.random() + "",
//       amount: rest[pt],
//       kind: "1",
//       kindOfVal: 1,
//       value: rest[pt],
//     },
//   ],
// }))
// _id: string | number
// paidType: string
// paidSummary: PaidSum[]
// paidDetail?: string | number

export const setCoverDetailAtom = atom(
  null,
  (get, set, { beginDate, endDate, details, description }: Cover) => {
    set(beginDateAtom, beginDate)
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

    let amounts = {} as { [key: string]: number }
    exceptCash.forEach((detail) => {
      amounts[detail.paidType] = detail.paidSummary[0].value || 0
    })
    set(currentAmountsAtom, amounts)
    set(descriptionAtom, description || "")
  }
)

export const description = atom<string>("")
