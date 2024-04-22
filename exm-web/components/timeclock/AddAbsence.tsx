import { FunctionComponent } from "react"
import { SquarePen, SunriseIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"

interface AddAbsenceProps {}

const AddAbsence: FunctionComponent<AddAbsenceProps> = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full justify-start gap-2" variant="outline">
          <SunriseIcon size={20} color="#FDB022" />
          <p>Add an absence request</p>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-xl">New time off request</SheetTitle>
          <SelectSeparator />
        </SheetHeader>

        <div className="my-4 gap-4 flex flex-col text-lg">
          <div className="flex items-center gap-4 justify-between">
            <Label htmlFor="name" className="text-right">
              Job
            </Label>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EJ">EJ</SelectItem>
                <SelectItem value="BJ">BJ</SelectItem>
                <SelectItem value="TJ">TJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Label htmlFor="name" className="flex gap-2 items-center">
            <SquarePen size={18} />
            <p>Note</p>
          </Label>
        </div>

        <Textarea placeholder="Leave a note" />
      </SheetContent>
    </Sheet>
  )
}

export default AddAbsence
