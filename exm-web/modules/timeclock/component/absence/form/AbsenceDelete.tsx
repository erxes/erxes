import React, { useState } from "react"
import { useAbsenceMutation } from "@/modules/timeclock/hooks/useAbsenceMutation"
import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  id: string
}

const AbsenceDelete = ({ id }: Props) => {
  const [open, setOpen] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }
  const { removeAbsence, loading } = useAbsenceMutation({
    callBack,
  })

  const renderDeleteForm = () => {
    return (
      <DialogContent>
        {loading ? <div>Loading ...</div> : null}

        <div className="flex flex-col items-center justify-center">
          <AlertTriangleIcon size={30} color={"#6569DF"} /> Are you sure?
        </div>

        <DialogFooter className="flex flex-col items-center justify-center sm:justify-center sm:space-x-2">
          <Button
            className="font-semibold rounded-md bg-[#F2F2F2] hover:bg-[#F2F2F2] text-black"
            onClick={() => setOpen(false)}
          >
            No, Cancel
          </Button>

          <Button
            type="submit"
            className="font-semibold rounded-md"
            onClick={() => removeAbsence(id)}
          >
            Yes, I am
          </Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <button
          className="hover:bg-[#F0F0F0] p-2 rounded cursor-pointer text-[#444] text-xs"
          disabled={loading}
        >
          Delete
        </button>
      </DialogTrigger>
      {renderDeleteForm()}
    </Dialog>
  )
}

export default AbsenceDelete
