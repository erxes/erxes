import React from "react"
import { IAbsenceType } from "@/modules/timeclock/types"

import AbsenceRequest from "../form/AbsenceRequest"
import CheckInOutRequest from "../form/CheckInOutRequest"

type Props = {
  queryParams: any
  absenceTypes: IAbsenceType[]
}

const AbsenceAction = ({ queryParams, absenceTypes }: Props) => {
  return (
    <div className="flex gap-2 p-0 justify-end">
      <AbsenceRequest queryParams={queryParams} absenceTypes={absenceTypes} />
      <CheckInOutRequest />
    </div>
  )
}

export default AbsenceAction
