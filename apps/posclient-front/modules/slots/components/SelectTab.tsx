import { selectedTabAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SelectTab = () => {
  const [selectedTab, setSelectedTab] = useAtom(selectedTabAtom)
  const slot = useAtomValue(slotCodeAtom)
  return (
    <Tabs
      className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
      value={selectedTab}
      onValueChange={(val) => setSelectedTab(val as "plan" | "products")}
    >
      <TabsList className="h-auto w-full gap-1 rounded-lg bg-muted p-1 shadow-lg">
        <TabsTrigger
          value="plan"
          className="h-8 min-w-36 flex-auto rounded-md text-[13px] font-medium text-muted-foreground hover:bg-accent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Заал {slot ? ` (${slot})` : ""}
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className="h-8 min-w-36 flex-auto rounded-md text-[13px] font-medium text-muted-foreground hover:bg-accent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Бараа
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default SelectTab
