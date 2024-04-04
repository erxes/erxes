import { Loader2Icon, LucideProps } from "lucide-react"

import { cn } from "@/lib/utils"

const Loader = ({
  className,
  style,
}: {
  className?: string
  style?: object
}) => {
  return (
    <LoaderWrapper className={className} style={style}>
      <LoaderIcon />
      <LoaderText />
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
  style,
}: {
  className?: string
  children: React.ReactNode
  style?: object
}) => {
  return (
    <div
      style={style}
      className={cn("flex items-center justify-center flex-auto", className)}
    >
      {children}
    </div>
  )
}

export const LoaderText = () => {
  return <span>Уншиж байна...</span>
}

export default Loader
