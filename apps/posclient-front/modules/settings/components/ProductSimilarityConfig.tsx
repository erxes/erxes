import { modeAtom } from "@/store"
import { similarityConfigAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { SettingsRow } from "./SettingsSection"

const ProductSimilarityConfig = () => {
  const [type, setType] = useAtom(similarityConfigAtom)
  const mode = useAtomValue(modeAtom)

  if (mode !== "coffee-shop") {
    return null
  }

  return (
    <SettingsRow
      title="Багцлах төрөл"
      description="Төстэй бүтээгдэхүүнийг юугаар нь бүлэглэх"
      control={
        <Tabs value={type} onValueChange={(val) => setType(val)}>
          <TabsList>
            <TabsTrigger value="config">Тохиргоо</TabsTrigger>
            <TabsTrigger value="category">Ангилал</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    />
  )
}

export default ProductSimilarityConfig
