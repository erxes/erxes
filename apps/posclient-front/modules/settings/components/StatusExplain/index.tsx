import { HourglassIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const StatusExplain = () => {
  return (
    <div className="mt-3 w-full">
      <div className="mb-3 font-bold">Захиалгын төлөвүүд</div>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map((status) => (
          <Item key={status.name}>
            <Indicator className={status.indicaterClassName}>
              {status.children || ""}
            </Indicator>
            {status.name}
          </Item>
        ))}
      </div>
    </div>
  )
}

const Item = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center">{children}</div>
)

const Indicator = ({
  className,
  children,
}: {
  className: string
  children?: React.ReactNode
}) => (
  <>
    <div
      className={cn(
        "flex justify-center items-center w-4 h-4 text-white rounded",
        className
      )}
    >
      {children}
    </div>
    <span className="mx-2">-</span>
  </>
)

const statuses = [
  {
    indicaterClassName: "bg-green-400",
    name: "Done",
  },
  {
    indicaterClassName: "bg-amber-400",
    name: "Doing/Redoing",
  },
  {
    indicaterClassName: "bg-amber-400",
    name: "Pending",
    children: <HourglassIcon className="w-3 h-3" />,
  },
  {
    indicaterClassName: "bg-zinc-600",
    name: "New",
  },
  {
    indicaterClassName: "bg-green-300",
    name: "Complete and not paid",
  },
  {
    indicaterClassName: "bg-zinc-600",
    name: "Kiosk-ooс",
    children: "*",
  },
  {
    indicaterClassName: "bg-zinc-600",
    name: "Tөлбөр төлөгдсөн",
    children: <span className="italic">ii</span>,
  },
]

export default StatusExplain
