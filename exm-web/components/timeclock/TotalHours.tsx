import { FunctionComponent } from "react"
import { EqualIcon, PlusIcon } from "lucide-react"

interface TotalHoursProps {}

const TotalHours: FunctionComponent<TotalHoursProps> = () => {
  const hours = [
    { type: "regular", text: "Regular", value: "223:50", icon: <PlusIcon /> },
    {
      type: "paidTimeOff",
      text: "Paid time off",
      value: "00:00",
      icon: <EqualIcon />,
    },
    { type: "totalPaidHours", text: "Total Paid Hours", value: "223:50" },
  ]

  return (
    <div className="flex gap-2">
      {hours.map((item: any) => {
        return (
          <div className="flex gap-2 items-center" key={item.type}>
            <div>
              <h3 className="text-base font-semibold">{item.value}</h3>
              <p className="text-sm">{item.text}</p>
            </div>
            {item.icon}
          </div>
        )
      })}
    </div>
  )
}

export default TotalHours
