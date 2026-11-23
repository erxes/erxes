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
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{children}</span>
    </>
  )
  const className =
    "inline-flex min-w-0 items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 text-sm font-semibold"

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
