import { formatNum } from "@/lib/utils"

export const StrikedPrice = ({ price }: { price: number | null }) =>
  price == null ? null : (
    <s className="ml-1 text-[10px] text-muted-foreground">
      {formatNum(price)}₮
    </s>
  )
