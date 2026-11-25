import Link from "next/link"
import { LucideIcon } from "lucide-react"

const HeaderTitle = ({
  href,
  icon: Icon,
  children,
}: {
  href?: string
  icon: LucideIcon
  children: React.ReactNode
}) => {
  const content = (
    <>
      <Icon className="size-4 flex-none" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </>
  )
  const className =
    "inline-flex h-7 min-w-0 items-center gap-2 rounded-md px-2 text-[13px] font-medium leading-4"

  if (!href) {
    return <h1 className={className}>{content}</h1>
  }

  return (
    <Link
      href={href}
      className={`${className} transition-colors hover:bg-accent`}
    >
      {content}
    </Link>
  )
}

export default HeaderTitle
