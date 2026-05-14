import { initialCategoryIdsAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import {
  HorizontalScrollMenu,
  ScrollMenuItem,
} from "@/components/ui/horizontalScrollMenu"

import CategoryItem from "./components/categoryItem/categoryItem.main"

const InitialCategories = () => {
  const initialCategoryIds = useAtomValue(initialCategoryIdsAtom)

  if (!(initialCategoryIds || []).length) {
    return null
  }

  return (
    <HorizontalScrollMenu separatorClassName="w-2 flex-none">
      {(initialCategoryIds || []).map((_id: string) => (
        <ScrollMenuItem itemId={_id} key={_id}>
          <CategoryItem _id={_id} />
        </ScrollMenuItem>
      ))}
    </HorizontalScrollMenu>
  )
}

export default InitialCategories
