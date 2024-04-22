import { FunctionComponent } from "react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

import AddAbsence from "./AddAbsence"
import AddShift from "./AddShift"
import ViewRequests from "./ViewRequests"

interface TimeRequestsProps {}

const TimeRequests: FunctionComponent<TimeRequestsProps> = () => {
  return (
    <Card className="w-[417px] border rounded-2xl flex flex-col">
      <CardHeader>
        <h3 className="text-2xl font-bold">Requests</h3>
      </CardHeader>
      <CardContent className="gap-5 flex flex-col">
        <AddShift />

        <AddAbsence />
      </CardContent>
      <CardFooter className="border-t mt-auto py-4">
        <ViewRequests />
      </CardFooter>
    </Card>
  )
}

export default TimeRequests
