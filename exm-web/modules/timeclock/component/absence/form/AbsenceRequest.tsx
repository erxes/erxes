import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import Uploader from "@/modules/feed/component/form/uploader/Uploader"
import { useAbsenceMutation } from "@/modules/timeclock/hooks/useAbsenceMutation"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"
import { IAbsenceType } from "@/modules/timeclock/types"
import { compareStartAndEndTimeOfSingleDate } from "@/modules/timeclock/utils"
import { IAttachment } from "@/modules/types"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  queryParams: any
  absenceTypes: IAbsenceType[]
}

type RequestByTime = {
  date: Date
  startTime: Date
  endTime: Date
}

type Request = {
  byDay: {
    requestDates: string[]
  }

  byTime: RequestByTime
}

const AbsenceRequest = ({ queryParams, absenceTypes }: Props) => {
  const { toast } = useToast()
  const currentUser = useAtomValue(currentUserAtom)

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedAbsenceType, setSelectedAbsenceType] = useState("")
  const [absenceIndex, setAbsenceIndex] = useState(0)

  const [explanation, setExplanation] = useState("")
  const [attachments, setAttachments] = useState<any>()
  const [attachmentUploading, setAttachmentUploading] = useState(false)

  const [request, setRequest] = useState<Request>({
    byDay: { requestDates: [] },
    byTime: { date: new Date(), startTime: new Date(), endTime: new Date() },
  })

  const [startTime, setStartTime] = useState(
    dayjs(request.byTime.startTime).format("HH:mm")
  )
  const [endTime, setEndTime] = useState(
    dayjs(request.byTime.endTime).format("HH:mm")
  )

  const requestTimeByDay =
    absenceTypes[absenceIndex]?.requestTimeType === "by day"

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { sendAbsenceRequest, loading } = useAbsenceMutation({ callBack })

  const generateSelectOptions = () => {
    return absenceTypes.map((absenceType, index) => ({
      value: absenceType.name,
      label: absenceType.name,
      arrayIndex: index,
    }))
  }

  const onTypeSelectChange = (selectedType: any) => {
    setSelectedAbsenceType(selectedType.value)
    setAbsenceIndex(selectedType.arrayIndex)
  }

  const onStartTimeChange = (e: any) => {
    setStartTime(e.target.vaue)
    onTimeChange(e.target.value, "start")
  }
  const onEndTimeChange = (e: any) => {
    setEndTime(e.target.value)
    onTimeChange(e.target.value, "end")
  }

  const onChangeStartTime = (starTimeValue) => {
    const [getCorrectStartTime, getCorrectEndTime] =
      compareStartAndEndTimeOfSingleDate(
        starTimeValue,
        request.byTime.endTime,
        request.byTime.date
      )

    setRequest({
      ...request,
      byTime: {
        ...request.byTime,
        endTime: getCorrectEndTime,
        startTime: getCorrectStartTime,
      },
    })
  }

  const onChangeEndTime = (endTimeValue) => {
    const [getCorrectStartTime, getCorrectEndTime] =
      compareStartAndEndTimeOfSingleDate(
        request.byTime.startTime,
        endTimeValue,
        request.byTime.date
      )

    setRequest({
      ...request,
      byTime: {
        ...request.byTime,
        endTime: getCorrectEndTime,
        startTime: getCorrectStartTime,
      },
    })
  }

  const onTimeChange = (input: any, type: string) => {
    const startDate = request.byTime.date

    const getDate = startDate
      ? startDate.toLocaleDateString()
      : new Date().toLocaleDateString()
    const validateInput = dayjs(getDate + " " + input).toDate()

    if (
      input instanceof Date &&
      startDate?.getUTCFullYear() === input.getUTCFullYear()
    ) {
      if (type === "start") {
        onChangeStartTime(input)
      } else {
        onChangeEndTime(input)
      }
    }

    if (!isNaN(validateInput.getTime())) {
      if (type === "start") {
        onChangeStartTime(validateInput)
      } else {
        onChangeEndTime(validateInput)
      }
    }
  }

  const checkInput = (userId: string) => {
    if (userId === "") {
      toast({ description: "No user was selected" })
    } else if (
      absenceTypes[absenceIndex].attachRequired &&
      attachments.url === ""
    ) {
      toast({ description: "No attachment was uploaded" })
    } else if (absenceTypes[absenceIndex].explRequired && explanation === "") {
      toast({ description: "No explanation was given" })
    } else {
      return true
    }
  }

  const onSubmit = () => {
    const validInput = checkInput(currentUser?._id!)
    if (validInput) {
      const absenceTimeType = absenceTypes[absenceIndex].requestTimeType
      const submitTime =
        absenceTimeType === "by day"
          ? request.byDay
          : {
              startTime: request.byTime.startTime,
              endTime: request.byTime.endTime,
            }

      sendAbsenceRequest(
        currentUser?._id!,
        absenceTypes[absenceIndex].name,
        explanation,
        attachments,
        submitTime,
        absenceTypes[absenceIndex]._id,
        absenceTimeType,
        calculateTotalHoursOfAbsence()
      )
      setOpen(false)
    }
  }

  const renderRequiredExplaination = () => {
    return (
      <>
        <Textarea
          className="scrollbar-hide"
          onChange={(e) => setExplanation(e.target.value)}
        />
      </>
    )
  }

  const renderRequiredAttachment = () => {
    return (
      <>
        <Uploader
          defaultFileList={attachments || []}
          onChange={setAttachments}
          setUploading={setAttachmentUploading}
        />
      </>
    )
  }

  const calculateTotalHoursOfAbsence = () => {
    const absenceTimeType = absenceTypes[absenceIndex]?.requestTimeType

    if (absenceTimeType === "by day") {
      const totalRequestedDays = request.byDay.requestDates.length

      const totalRequestedDaysTime =
        totalRequestedDays *
        (absenceTypes[absenceIndex].requestHoursPerDay || 0)

      return totalRequestedDaysTime < 1
        ? `${Math.round(totalRequestedDaysTime * 60)} minutes`
        : dayjs()
            .startOf("day")
            .add(totalRequestedDaysTime, "hours")
            .format("HH:mm")
    }

    const totalHours =
      (request.byTime.endTime.getTime() - request.byTime.startTime.getTime()) /
      3600000

    return totalHours < 1
      ? `${Math.round(totalHours * 60)} minutes`
      : dayjs().startOf("day").add(totalHours, "hours").format("HH:mm")
  }

  const renderTotalRequestTime = () => {
    const totalRequestedDays = request.byDay.requestDates.length

    if (requestTimeByDay) {
      return (
        <div className="flex">
          <div className="flex flex-col">
            <div>Total days :</div>
            <div>Total hours :</div>
          </div>
          <div className="flex flex-col">
            <div>{totalRequestedDays}</div>
            <div>{calculateTotalHoursOfAbsence()}</div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex">
        <div>Total hours :</div>
        <div> {calculateTotalHoursOfAbsence()}</div>
      </div>
    )
  }

  const renderDateSelection = () => {
    return (
      <>
        <DatePicker
          date={date}
          setDate={setDate}
          className="w-full"
          mode="multiple"
        />
        {renderTotalRequestTime()}
      </>
    )
  }

  const renderDateAndTimeSelection = () => {
    return (
      <>
        <div className="flex gap-2 justify-between">
          <DatePicker date={date} setDate={setDate} className="w-full" />
          <input
            type="time"
            className="w-full"
            onChange={onStartTimeChange}
            value={startTime}
          />
          <input
            type="time"
            className="w-full"
            onChange={onEndTimeChange}
            value={endTime}
          />
        </div>
        {renderTotalRequestTime()}
      </>
    )
  }

  const renderRequestForm = () => {
    return (
      <DialogContent>
        <DialogHeader>Create Request</DialogHeader>
        {requestTimeByDay
          ? renderDateSelection()
          : renderDateAndTimeSelection()}
        <div className="flex flex-col gap-2 items-center">
          <Select
            className="w-full"
            placeholder="Request Type"
            options={absenceTypes && generateSelectOptions()}
            onChange={onTypeSelectChange}
            defaultValue={{
              value: selectedAbsenceType,
              label: selectedAbsenceType,
            }}
          />
          {absenceTypes.length > 0 &&
            absenceTypes[absenceIndex].explRequired &&
            renderRequiredExplaination()}
          {absenceTypes.length > 0 &&
            absenceTypes[absenceIndex].attachRequired &&
            renderRequiredAttachment()}
        </div>

        <Button
          className="font-semibold w-full rounded-md"
          disabled={attachmentUploading}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </DialogContent>
    )
  }
  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <button className="px-3 py-2 bg-[#3dcc38] text-[#fff] rounded-md">
          Create Request
        </button>
      </DialogTrigger>
      {renderRequestForm()}
    </Dialog>
  )
}

export default AbsenceRequest
