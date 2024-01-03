"use client"

import { activeCatName } from "@/store"
import { useQuery } from "@apollo/client"
import { Label } from "@radix-ui/react-label"
import { useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "@/components/ui/image"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"

import { queries } from "../../graphql"

const CategoryItem = ({ _id, active }: { _id: string; active: boolean }) => {
  const setActiveCatName = useSetAtom(activeCatName)
  const { data, loading } = useQuery(queries.getKioskCategory, {
    variables: {
      _id,
    },
  })

  const { name, attachment } = data?.poscProductCategoryDetail || {}

  return (
    <div>
      <RadioGroupItem value={_id} id={_id} className="peer sr-only" />
      <Label
        className={cn(
          "w-full text-center py-1 rounded-r-3xl block",
          active && "text-white bg-primary/90 overflow-hidden"
        )}
        htmlFor={_id}
        onClick={() => setActiveCatName(name)}
      >
        <AspectRatio ratio={2}>
          {!loading && (
            <Image
              src={attachment?.url || ""}
              alt=""
              sizes="20vw"
              className="object-contain "
            />
          )}
        </AspectRatio>
        <div className="font-bold uppercase pt-2">
          {loading ? <Skeleton className="w-16 h-4 mx-auto" /> : name}
        </div>
      </Label>
    </div>
  )
}

export default CategoryItem
