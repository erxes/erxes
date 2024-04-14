import { FunctionComponent } from "react"
import { FileDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TimeExportProps {}

const TimeExport: FunctionComponent<TimeExportProps> = () => {
  return (
    <Button variant="outline" className="flex gap-2">
      <FileDownIcon size={20} /> <p>Export</p>
    </Button>
  )
}

export default TimeExport
