import { Label } from "@radix-ui/react-label"

import { Checkbox } from "@/components/ui/checkbox"

const DisableItem = () => {
  return (
    <Label
      className="w-full pb-5 flex gap-2 items-center"
      htmlFor="printOnlyNew"
    >
      <Checkbox
        id="printOnlyNew"
      />
      Хоол хязгаарлалт
    </Label>
  )
}

export default DisableItem
