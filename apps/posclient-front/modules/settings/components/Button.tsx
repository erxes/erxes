import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

const SettingsButton = (props: ButtonProps) => (
  <Button
    className={cn(
      "h-9 w-full px-2 text-xs font-medium",
      props.loading && "px-0"
    )}
    variant="outline"
    {...props}
  />
)

export default SettingsButton
