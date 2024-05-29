import { useQuery } from "@apollo/client"

import {
  HorizontalScrollMenu,
  ScrollMenuItem,
} from "@/components/ui/horizontalScrollMenu"

import { queries } from "../auth/graphql"
import CategoryItem from "./components/categoryItem/categoryItem.main"

const InitialCategories = () => {
  const { data, loading } = useQuery(queries.getInitialCategories)

  if (loading) return null

  const { initialCategoryIds } = data?.currentConfig || {}

  if (!(initialCategoryIds || []).length) return null

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
