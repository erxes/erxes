"use client"

import {
  columnNumberAtom,
  showFilterAtom,
  showItemsAtom,
} from "@/store/progress.store"
import { useAtom } from "jotai"
import { Grid2x2Icon, GridIcon, PaintbrushIcon, RowsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Customize = () => {
  const [showFilter, setShowFilter] = useAtom(showFilterAtom)
  const [columnNumber, setColumnNumber] = useAtom(columnNumberAtom)
  const [showItems, setShowItems] = useAtom(showItemsAtom)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="font-semibold" size="sm">
          <PaintbrushIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 text-xs">
        <CardHeader>
          <CardTitle>Tохируулах</CardTitle>
          <CardDescription>Харагдах байдлыг тохируулна уу</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-2 items-center">
            <Switch
              id="showFilter"
              checked={showFilter}
              onCheckedChange={(e) => setShowFilter(e)}
            />
            <Label htmlFor="showFilter" className="font-semibold  pb-0.5">
              Шүүлтүүр харуулах
            </Label>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Баганын тоо сонгох</Label>
            <Tabs
              className="w-full"
              value={columnNumber.toString()}
              onValueChange={(val) => setColumnNumber(parseInt(val))}
            >
              <TabsList className="w-full">
                <TabsTrigger value="1" className="flex-auto">
                  <RowsIcon className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="2" className="flex-auto">
                  <Grid2x2Icon className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="3" className="flex-auto">
                  <GridIcon className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex space-x-2 items-center">
            <Switch
              id="showItems"
              checked={showItems}
              onCheckedChange={(e) => setShowItems(e)}
            />
            <Label htmlFor="showItems" className="font-semibold pb-0.5">
              Захиалсан бүтээгдэхүүнүүд
            </Label>
          </div>
        </CardContent>
      </PopoverContent>
    </Popover>
  )
}

export default Customize
