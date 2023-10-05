import { ArrowRight } from "lucide-react"

import { ICategory } from "@/types/product.types"
import { Button } from "@/components/ui/button"

const SubCategory = ({
  subCats,
  name,
  chooseCat,
  _id,
}: ICategory & {
  subCats: ICategory[]
  chooseCat: (string: string) => void
}) => {
  return (
    <div className="">
      <div className="text-sm leading-none font-semibold pb-1">{name}</div>
      {subCats.length > 0 && (
        <div className="pb-1 text-sm text-slate-500">
          {subCats.map((e) => (
            <div
              key={e._id}
              className="font-medium hover:text-primary cursor-pointer"
              onClick={() => chooseCat(e._id)}
            >
              {e.name}
            </div>
          ))}
        </div>
      )}
      <Button
        variant={"link"}
        className="h-auto p-0 font-semibold"
        onClick={() => chooseCat(_id)}
      >
        Бүгдийг үзэх <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}

export default SubCategory
