import ProductPrice from "@/modules/products/productPriceInfo";
import { updateCartAtom } from "@/store/cart.store";
import { banFractionsAtom } from "@/store/config.store";
import { orderTypeAtom } from "@/store/order.store";
import { motion, Variants } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { OrderItem } from "@/types/order.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FocusChanger } from "@/components/ui/focus-changer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Uploader from "@/components/ui/uploader";
import CartItemStatus from "./cartItemStatus";

const CartItem = ({
  productName,
  count,
  unitPrice,
  status,
  isTake,
  _id,
  description,
  attachment,
  idx,
  productId,
}: OrderItem & { idx: number }) => {
  const changeItem = useSetAtom(updateCartAtom);
  const banFractions = useAtomValue(banFractionsAtom);
  const type = useAtomValue(orderTypeAtom);

  return (
    <Collapsible className={cn(idx === 0 && "bg-primary/10")}>
        <motion.div
          variants={itemVariants}
          animate="animate"
          initial="initial"
          exit="exit"
          className="border-b mx-4"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-stretch overflow-hidden">
            <Label className="flex w-1/12 flex-col justify-between pt-4 pb-3" htmlFor={`checkbox-${_id}`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Checkbox
                    id={_id}
                    checked={isTake}
                    disabled={type !== "eat"}
                    onCheckedChange={(checked) =>
                      changeItem({ _id, isTake: !!checked })
                    }
                  />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Авч явах</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <Button className="h-6 w-6 p-0" variant="ghost">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Нэмэлт мэдээлэл</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>

            <div className="w-7/12 py-4 pl-3 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <small className="block h-8 overflow-hidden leading-4">
                      {productName}
                    </small>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{productName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mt-1 flex items-center">
                <CartItemStatus status={status} />
                <ProductPrice unitPrice={unitPrice} productId={productId} className="ml-2 text-xs" />
              </div>
            </div>

            <div className="flex w-5/12 items-center justify-end">
              <Button className={countBtnClass} onClick={() => changeItem({ _id, count: (count || 0) - 1 })} disabled={count === -1}>
                <Minus className="h-3 w-3" strokeWidth={4} />
              </Button>
              <FocusChanger>
                <Input
                  className="mx-2 w-10 border-none p-1 text-center text-sm font-semibold"
                  type="number"
                  onChange={(e) => {
                    const {value} = e.target;
                    changeItem({
                      _id,
                      count: banFractions ? parseInt(value) || 0 : Number(value) || 0,
                      status,
                    });
                  }}
                  value={count.toString()}
                />
              </FocusChanger>
              <Button className={countBtnClass} onClick={() => changeItem({ _id, count: (count || 0) + 1 })}>
                <Plus className="h-3 w-3" strokeWidth={4} />
              </Button>
            </div>
          </div>

          <motion.div variants={itemVariants}>
            <CollapsibleContent className="w-full pb-3 space-y-2">
              <div>
                <Label htmlFor={`description-${_id}`}>Тайлбар</Label>
                <Input
                  id={`description-${_id}`}
                  placeholder="Тайлбар бичих"
                  value={description}
                  onChange={(e) => changeItem({ _id, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`attachment-${_id}`}>Хавсралт</Label>
                <Uploader
                  id={`attachment-${_id}`}
                  attachment={attachment}
                  setAttachment={(attachment?: { url?: string } | null) =>
                    changeItem({ _id, attachment })
                  }
                />
              </div>
            </CollapsibleContent>
          </motion.div>
        </motion.div>
          </Collapsible>
  );
};

export const countBtnClass = "h-7 w-7 rounded-full p-0 bg-amber-400 hover:bg-amber-400/90 text-black";

const itemVariants: Variants = {
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: { delay: 0.15, duration: 0.15 },
    },
  },
  initial: {
    opacity: 0,
    height: 0,
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: { delay: 0, duration: 0.1 },
    },
  },
};

export default CartItem;