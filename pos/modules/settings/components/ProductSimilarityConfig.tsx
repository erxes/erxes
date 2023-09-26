import { similarityConfigAtom } from "@/store/config.store"
import { useAtom } from "jotai"

import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ProductSimilarityConfig = () => {
  const [type, setType] = useAtom(similarityConfigAtom)

  return (
    <div className="w-full pb-5">
      <Label className="block pb-1">Багцлах төрөл</Label>
      <Tabs
        className="w-full"
        value={type}
        onValueChange={(val) => setType(val)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="config" className="flex-auto">
            Тохиргоо
          </TabsTrigger>
          <TabsTrigger value="category" className="flex-auto">
            Ангилал
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

export default ProductSimilarityConfig
