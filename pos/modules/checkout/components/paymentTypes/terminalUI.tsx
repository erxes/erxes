import { Loader2, MonitorSmartphone } from "lucide-react"

const TerminalUI = () => {
  return (
    <div className="flex flex-auto flex-col items-center justify-center">
      <MonitorSmartphone className="h-14 w-14" strokeWidth={0.8} />
      <div className="flex items-center pt-2">
        <Loader2 className="mr-1 h-5 w-5 animate-spin" strokeWidth={2} />
        Терминалаас хариу хүлээж байна
      </div>
    </div>
  )
}

export default TerminalUI
