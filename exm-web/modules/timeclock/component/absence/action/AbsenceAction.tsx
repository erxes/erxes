import React, { useState } from "react"
import { IAbsenceType } from "@/modules/timeclock/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import AbsenceRequest from "../form/AbsenceRequest"
import CheckInOutRequest from "../form/CheckInOutRequest"

type Props = {
  queryParams: any
  absenceTypes: IAbsenceType[]
}

const AbsenceAction = ({ queryParams, absenceTypes }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex gap-2 p-0 justify-end">
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild={true}>
          <Button className="bg-[#3dcc38] text-[#fff] rounded-md">
            Create Request
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Request</DialogTitle>
          </DialogHeader>
          <AbsenceRequest
            queryParams={queryParams}
            absenceTypes={absenceTypes}
            setOpen={setOpen}
          />
        </DialogContent>
      </Dialog>
      <CheckInOutRequest />
    </div>
  )
}

export default AbsenceAction
