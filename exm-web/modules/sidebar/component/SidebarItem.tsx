import { FunctionComponent } from "react"
import Link from "next/link"

interface SideBarItemProps {
  isActive: boolean
  href: string
  value: string
  Icon: any
}

const SideBarItem: FunctionComponent<SideBarItemProps> = (props) => {
  const { href, isActive, value, Icon } = props

  return (
    <Link href={href}>
      <div
        className={`px-4 h-14 hover:bg-gray-100 flex gap-2 items-center text-base text-gray-500 ${
          isActive ? "bg-gray-100 text-primary" : ""
        }`}
      >
        <Icon size={18} />
        <p>{value}</p>
      </div>
    </Link>
  )
}

export default SideBarItem
