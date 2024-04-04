import { descriptionAtom } from "@/store/cover.store"
import { useAtom } from "jotai"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const Description = () => {
  const [description, setDescription] = useAtom(descriptionAtom)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Хаалтын тэмдэглэл</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </CardContent>
    </Card>
  )
}

export default Description
