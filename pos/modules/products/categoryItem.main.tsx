import { activeCatName, activeCategoryAtom } from "@/store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { queries } from "./graphql"

const CategoryItem = ({ _id }: { _id: string }) => {
  const [activeCat, setActiveCat] = useAtom(activeCategoryAtom)
  const setCatName = useSetAtom(activeCatName)

  const { data, loading } = useQuery(queries.getInitialCategory, {
    variables: {
      _id,
    },
  })

  if (loading)
    return (
      <Button
        variant={"outline"}
        size="sm"
        className="my-2 whitespace-nowrap font-bold"
      >
        <Skeleton style={{ width: 80 }} className="h-3" />
      </Button>
    )

  const { name } = data?.poscProductCategoryDetail || {}

  return (
    <Button
      variant={activeCat !== _id ? "outline" : undefined}
      size="sm"
      className={cn(
        "my-2 whitespace-nowrap font-bold",
        activeCat !== _id && " text-black/75"
      )}
      onClick={() => {
        if (activeCat === _id) {
          setActiveCat("")
          setCatName("")
        } else {
          setActiveCat(_id)
          setCatName(name)
        }
      }}
    >
      {name}
    </Button>
  )
}

export default CategoryItem
