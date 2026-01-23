import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

const SettingsButton = (props: ButtonProps) => (
  <Button
    className={cn("h-auto w-full p-2 font-semibold", props.loading && "px-0")}
    variant="outline"
    {...props}
  />
)

export default SettingsButton
