import { FunctionComponent } from "react"
import { SunriseIcon } from "lucide-react"

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

import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader } from "../ui/card"
import { SelectSeparator } from "../ui/select"

interface ViewRequestsProps {}

const ViewRequests: FunctionComponent<ViewRequestsProps> = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full" variant="outline">
          View your requests
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-xl">My Requests</SheetTitle>
          <SelectSeparator />
        </SheetHeader>

        <div className="my-4 gap-4 flex flex-col">
          <Card>
            <CardHeader className="p-4">
              <div className="flex gap-4 items-center text-lg justify-between">
                <div>
                  <div>
                    <span className="text-primary-light mr-2">Mon 22/1</span>
                    <span>Request to edit a shift</span>
                  </div>
                  <Label htmlFor="label">Requested on 1/20/2024 at 13:40</Label>
                </div>

                <Badge className="w-[100px] h-[41px] text-lg font-medium">
                  Pending
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ViewRequests
