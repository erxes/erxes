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
import { CalendarIcon, Paperclip } from "lucide-react"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import uploadHandler from "@/components/uploader/uploadHandler"

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
    requestDates: Date[]
  }

  byTime: RequestByTime
}

const AbsenceRequest = ({ queryParams, absenceTypes }: Props) => {
  const { toast } = useToast()
  const currentUser = useAtomValue(currentUserAtom)

  const [open, setOpen] = useState(false)
  const [selectedAbsenceType, setSelectedAbsenceType] = useState("")
  const [absenceIndex, setAbsenceIndex] = useState(0)

  const [explanation, setExplanation] = useState("")
  const [attachments, setAttachments] = useState<IAttachment[]>([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)

  const [request, setRequest] = useState<Request>({
    byDay: { requestDates: [] },
    byTime: { date: new Date(), startTime: new Date(), endTime: new Date() },
  })

  const requestTimeByDay =
    absenceTypes[absenceIndex]?.requestTimeType === "by day"

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { sendAbsenceRequest } = useAbsenceMutation({ callBack })

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

  const checkInput = (userId: string) => {
    if (userId === "") {
      toast({ description: "No user was selected" })
    } else if (
      absenceTypes[absenceIndex].attachRequired &&
      attachments?.length === 0
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
          placeholder="Please write short explanation"
          className="scrollbar-hide"
          onChange={(e) => setExplanation(e.target.value)}
        />
      </>
    )
  }

  const handleAttachmentChange = (e: any) => {
    const files = e.target.files

    uploadHandler({
      files,
      beforeUpload: () => {
        setAttachmentUploading(true)
        return
      },

      afterUpload: ({ response, fileInfo }) => {
        setAttachmentUploading(false)
        setAttachments((prevAttachments) => [
          ...prevAttachments,
          Object.assign({ url: response }, fileInfo),
        ])
      },
    })
  }

  const renderRequiredAttachment = () => {
    return (
      <div className="flex justify-between self-start items-center gap-2">
        <label className="cursor-pointer bg-primary p-2 rounded-md">
          <input
            autoComplete="off"
            multiple={true}
            type="file"
            onChange={handleAttachmentChange}
            className="hidden"
          />
          <Paperclip size={18} color="#fff" />
        </label>
        <div>{attachments.length !== 0 ? attachments[0].name : null}</div>
      </div>
    )
  }

  const calculateTotalHoursOfAbsence = () => {
    const absenceTimeType = absenceTypes[absenceIndex]?.requestTimeType

    if (absenceTimeType === "by day") {
      const totalRequestedDays = request.byDay.requestDates.length

      const totalRequestedDaysTime =
        totalRequestedDays *
        (absenceTypes[absenceIndex].requestHoursPerDay || 0)

      return totalRequestedDaysTime.toFixed(1)
    }

    const totalHours = parseInt(
      (
        (request.byTime.endTime.getTime() -
          request.byTime.startTime.getTime()) /
        3600000
      ).toFixed(2),
      10
    )

    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours - hours) * 60)

    const formattedTime = dayjs()
      .hour(hours)
      .minute(minutes)
      .format("HH[h] mm[m]")
    return formattedTime
  }

  const renderTotalRequestTime = () => {
    const totalRequestedDays = request.byDay.requestDates.length

    if (requestTimeByDay) {
      return (
        <div className="flex gap-3 font-bold text-[18px] justify-center">
          <div>Total days : {totalRequestedDays}</div>
          <div>Total hours : {calculateTotalHoursOfAbsence()}</div>
        </div>
      )
    }

    return (
      <div className="flex gap-3 font-bold text-[18px] justify-center">
        <div>Total hours : {calculateTotalHoursOfAbsence()}</div>
      </div>
    )
  }

  const onDateSelectChange = (days: Date[]) => {
    if (days) {
      setRequest({ ...request, byDay: { requestDates: days } })
    }
  }

  const renderDateSelection = () => {
    const days = request.byDay.requestDates?.length
    return (
      <>
        <Popover>
          <PopoverTrigger asChild={true}>
            <Button
              variant={"outline"}
              className={"w-full justify-start text-left font-normal"}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {days !== 0 ? `${days} day selected` : "Choose Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="multiple"
              selected={request.byDay.requestDates}
              onSelect={(day) => onDateSelectChange(day!)}
            />
          </PopoverContent>
        </Popover>
        {renderTotalRequestTime()}
      </>
    )
  }

  const onDateChange = (selectedDate: Date) => {
    const [getCorrectStartTime, getCorrectEndTime] =
      compareStartAndEndTimeOfSingleDate(
        request.byTime.startTime,
        request.byTime.endTime,
        selectedDate
      )

    setRequest({
      ...request,
      byTime: {
        date: new Date(selectedDate),
        endTime: getCorrectEndTime as Date,
        startTime: getCorrectStartTime as Date,
      },
    })
  }

  const onChangeStartTime = (starTimeValue: Date) => {
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
        endTime: getCorrectEndTime as Date,
        startTime: getCorrectStartTime as Date,
      },
    })
  }

  const onChangeEndTime = (endTimeValue: Date) => {
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
        endTime: getCorrectEndTime as Date,
        startTime: getCorrectStartTime as Date,
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

  const renderDateAndTimeSelection = () => {
    return (
      <>
        <div className="flex gap-2 justify-between">
          <DatePicker
            date={request.byTime.date}
            setDate={(selectedDate) => onDateChange(selectedDate!)}
            className="w-full"
          />
          <input
            type="time"
            className="w-full text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md px-3"
            onChange={(e) => onTimeChange(e.target.value, "start")}
            value={dayjs(request.byTime.startTime).format("HH:mm")}
            placeholder="Start Time"
          />
          <input
            type="time"
            className="w-full text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md px-3"
            onChange={(e) => onTimeChange(e.target.value, "end")}
            value={dayjs(request.byTime.endTime).format("HH:mm")}
            placeholder="End Time"
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
