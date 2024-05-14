import { FunctionComponent } from "react"
import { PlusIcon, SunriseIcon } from "lucide-react"

import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"

interface YourRequestsProps {}

const YourRequests: FunctionComponent<YourRequestsProps> = () => {
  return (
    <Card className="w-[417px] border rounded-2xl flex flex-col">
      <CardHeader>
        <h3 className="text-2xl font-bold">Requests</h3>
      </CardHeader>
      <CardContent className="gap-5 flex flex-col">
        <Button className="w-full justify-start gap-2" variant="outline">
          <PlusIcon size={20} color="#2E90FA" />
          <p>Add a shift request</p>
        </Button>

        <Button className="w-full justify-start gap-2" variant="outline">
          <SunriseIcon size={20} color="#FDB022" />
          <p>Add an absence request</p>
        </Button>
      </CardContent>
      <CardFooter className="border-t mt-auto py-4">
        <Button className="w-full" variant="outline">
          View your requests
        </Button>
      </CardFooter>
    </Card>
  )
}

export default YourRequests
