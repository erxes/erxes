import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

const SettingsButton = (props: ButtonProps) => (
  <Button
    className={cn(
      "h-8 w-full justify-center rounded px-2 text-[13px] font-medium",
      props.loading && "px-0"
    )}
    variant="outline"
    {...props}
  />
)

export default SettingsButton
