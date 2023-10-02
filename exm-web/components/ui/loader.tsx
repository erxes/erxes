import { Loader2Icon, LucideProps } from "lucide-react"

import { cn } from "@/lib/utils"

const Loader = ({ className }: { className?: string }) => {
  return (
    <LoaderWrapper className={className}>
      <LoaderIcon />
    </LoaderWrapper>
  )
}

export const LoaderIcon = ({ className, ...rest }: LucideProps) => {
  return (
    <Loader2Icon
      className={cn("animate-spin h-5 w-5 mr-2", className)}
      {...rest}
    />
  )
}

export const LoaderWrapper = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div
      className={cn("flex items-center justify-center flex-auto", className)}
    >
      {children}
    </div>
  )
}

export default Loader
