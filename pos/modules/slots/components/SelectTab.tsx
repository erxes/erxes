import { selectedTabAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SelectTab = () => {
  const [selectedTab, setSelectedTab] = useAtom(selectedTabAtom)
  const slot = useAtomValue(slotCodeAtom)
  return (
    <Tabs
      className="absolute bottom-3 left-1/2 -translate-x-1/2"
      value={selectedTab}
      onValueChange={(val) => setSelectedTab(val as any)}
    >
      <TabsList className="w-full">
        <TabsTrigger value="plan" className="flex-auto min-w-[180px]">
          Ширээ {slot ? ` (${slot})` : ""}
        </TabsTrigger>
        <TabsTrigger value="products" className="flex-auto min-w-[180px]">
          Бараа
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default SelectTab
