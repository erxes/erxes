import ProductPrice from "@/modules/products/productPriceInfo";
import { updateCartAtom } from "@/store/cart.store";
import { banFractionsAtom } from "@/store/config.store";
import { orderTypeAtom } from "@/store/order.store";
import { motion, Variants } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { totalAmountAtom } from "@/store/cart.store";
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
import ProductCancel from "@/app/(main)/(orders)/components/history/productCancel";
import { useState, useEffect } from "react";

interface CartItemProps extends OrderItem {
  idx: number;
  productIds?: string[];
  combinedCount?: number;
}

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
  combinedCount,
}: CartItemProps) => {
  const changeItem = useSetAtom(updateCartAtom);
  const banFractions = useAtomValue(banFractionsAtom);
  const type = useAtomValue(orderTypeAtom);
  const total = useAtomValue(totalAmountAtom);
  const [showCancel, setShowCancel] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      setShowCancel(total === 0);
    }
  }, [total, hasMounted]);

  const handleChangeItem = (changes: Partial<OrderItem>) => {
    const ids = _id.split(",");
    ids.forEach((id) => {
      changeItem({ ...changes, _id: id });
    });
  };

  const displayCount = combinedCount !== undefined ? combinedCount : count;
  console.log(displayCount , productName)


  return (
    <Collapsible className={cn(idx === 0 && "bg-primary/10")}>
      {showCancel && (
        <ProductCancel
          _id={_id}
          number={(idx + 1).toString()}
          refetchQueries={["ActiveOrders"]}
          onCompleted={() => {
            console.log(`Order ${_id} cancelled`);
            setShowCancel(false);
          }}
        />
      )}

      {count !== 0 && (
        <motion.div
          variants={itemVariants}
          animate="animate"
          initial="initial"
          className="border-b mx-4"
          exit="exit"
          transition={{
            duration: 0.3,
          }}
        >
          <div className={"flex items-stretch overflow-hidden"}>
            <Label
              className="flex w-1/12 flex-col justify-between pt-4 pb-3"
              htmlFor={_id}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox
                      id={_id}
                      checked={isTake}
                      disabled={type !== "eat"}
                      onCheckedChange={(checked) =>
                        handleChangeItem({ isTake: !!checked })
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
                <ProductPrice
                  unitPrice={unitPrice}
                  productId={productId}
                  className="ml-2 text-xs"
                />
              </div>
            </div>
            <div className="flex w-5/12 items-center justify-end">
              <Button
                className={countBtnClass}
                onClick={() =>
                  handleChangeItem({ count: (displayCount || 0) - 1, status })
                }
              >
                <Minus className="h-3 w-3" strokeWidth={4} />
              </Button>
              <FocusChanger>
                <Input
                  className="mx-2 w-10 border-none p-1 text-center text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  type="number"
                  onChange={(e) =>
                    handleChangeItem({
                      count: banFractions
                        ? parseInt(e.target.value)
                        : Number(e.target.value),
                      status,
                    })
                  }
                  value={displayCount.toString()}
                />
              </FocusChanger>
              <Button
                className={countBtnClass}
                onClick={() =>
                  handleChangeItem({ count: (displayCount || 0) + 1 })
                }
              >
                <Plus className="h-3 w-3" strokeWidth={4} />
              </Button>
            </div>
          </div>
          <CollapsibleContent className="w-full pb-3 space-y-2">
            <div>
              <Label htmlFor={`description-${_id}`}>Тайлбар</Label>
              <Input
                id={`description-${_id}`}
                placeholder="Тайлбар бичих"
                value={description}
                onChange={(e) =>
                  handleChangeItem({ description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor={`attachment-${_id}`}>Хавсралт</Label>
              <Uploader
                id={`attachment-${_id}`}
                attachment={attachment}
                setAttachment={(attachment?: { url?: string } | null) =>
                  handleChangeItem({ attachment })
                }
              />
            </div>
          </CollapsibleContent>
        </motion.div>
      )}
    </Collapsible>
  );
};

export const countBtnClass =
  "h-7 w-7 rounded-full p-0 bg-amber-400 hover:bg-amber-400/90 text-black";

const itemVariants: Variants = {
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: {
        delay: 0.15,
        duration: 0.15,
      },
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
      opacity: {
        delay: 0,
        duration: 0.1,
      },
    },
  },
};

export default CartItem;

