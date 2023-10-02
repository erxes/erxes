import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const ChooseProperty = () => {
  return (
    <div>
      <Label className="font-semibold text-xs">Хэмжээ сонгох</Label>
      <RadioGroup className="grid grid-cols-3 gap-2 mt-1 font-semibold">
        <div>
          <RadioGroupItem value="card" id="card" className="peer sr-only" />
          <Label
            htmlFor="card"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            Card
          </Label>
        </div>
        <div>
          <RadioGroupItem value="visa" id="visa" className="peer sr-only" />
          <Label
            htmlFor="visa"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            Card
          </Label>
        </div>
        <div>
          <RadioGroupItem value="haha" id="haha" className="peer sr-only" />
          <Label
            htmlFor="haha"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            Card
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

export default ChooseProperty
