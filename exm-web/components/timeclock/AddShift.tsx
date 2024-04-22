"use client"

import { FunctionComponent, useState } from "react"
import { PlusIcon, SquarePen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Card, CardContent } from "../ui/card"
import { DatePicker } from "../ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"

interface AddShiftProps {}

const AddShift: FunctionComponent<AddShiftProps> = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date())
  const [toDate, setToDate] = useState<Date | undefined>(new Date())

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full justify-start gap-2" variant="outline">
          <PlusIcon size={20} color="#2E90FA" />
          <p>Add a shift request</p>
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-xl">Add a shift request</SheetTitle>
          <SelectSeparator />
        </SheetHeader>

        <div className="my-4 gap-4 flex flex-col text-lg">
          <div className="flex items-center gap-4 justify-between">
            <Label htmlFor="name" className="text-right">
              Job
            </Label>

            <Select>
              <SelectTrigger className="max-w-max min-w-[88px]">
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EJ">EJ</SelectItem>
                <SelectItem value="BJ">BJ</SelectItem>
                <SelectItem value="TJ">TJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 justify-between">
            <Label htmlFor="name" className="text-right">
              Starts
            </Label>

            <div className="flex gap-4 items-center">
              <DatePicker
                className="w-[128px]"
                setDate={setFromDate}
                date={fromDate}
              />

              <span>At</span>

              <Select>
                <SelectTrigger className="w-[88px]">
                  <SelectValue placeholder="08:00" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-between">
            <Label htmlFor="name" className="text-right">
              Ends
            </Label>

            <div className="flex gap-4 items-center">
              <DatePicker
                className="w-[128px]"
                setDate={setToDate}
                date={toDate}
              />

              <span>At</span>

              <Select>
                <SelectTrigger className="w-[88px]">
                  <SelectValue placeholder="08:00" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="bg-primary-light text-white text-lg flex items-center justify-between gap-4 px-4 py-2 rounded-md">
              <span>Total hours</span>
              <b>09:00</b>
            </CardContent>
          </Card>

          <h3 className="text-xl">Shift Attachments</h3>

          <Label htmlFor="name" className="flex gap-2 items-center">
            <SquarePen size={18} />
            <p>Note</p>
          </Label>

          <Textarea placeholder="Leave a note" />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AddShift
