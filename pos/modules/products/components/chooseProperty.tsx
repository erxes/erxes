import { RadioGroupContextValue } from "@radix-ui/react-radio-group"

import { Group } from "@/types/product.types"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const ChooseProperty = ({
  group,
  properties,
  value,
  setFilterFields,
}: {
  group: Group
  properties: string[]
  value?: string
  setFilterFields: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string
    }>
  >
}) => {
  const handleChange: RadioGroupContextValue["onValueChange"] = (
    value: string
  ) => {
    setFilterFields((prev) => ({ ...prev, [group.fieldId]: value }))
  }

  return (
    <div>
      <Label className="font-semibold text-xs">{group.title}</Label>
      <RadioGroup
        className="grid grid-cols-3 gap-2 mt-1 font-semibold"
        value={value}
        onValueChange={handleChange}
      >
        {properties.map((property: any) => (
          <div key={property}>
            <RadioGroupItem
              value={property}
              id={property}
              className="peer sr-only"
            />
            <Label
              htmlFor={property}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              {property}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default ChooseProperty
