import { descriptionAtom } from "@/store/order.store"
import { useAtom } from "jotai"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const Description = () => {
  const [description, setDescription] = useAtom(descriptionAtom)

  return (
    <div>
      <Label htmlFor="delivery" className="block pb-1">
        Дэлгэрэнгүй
      </Label>
      <Textarea
        id="delivery"
        className="max-h-20"
        value={description || ""}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
  )
}

export default Description
