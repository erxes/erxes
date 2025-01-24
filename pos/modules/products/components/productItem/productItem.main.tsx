import React from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { mobileTabAtom, modeAtom } from "@/store";
import { addToCartAtom } from "@/store/cart.store";
import { IProduct } from "@/types/product.types";
import { formatNum } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Image from "@/components/ui/image";
import { ToastAction } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const allowZeroRemainderAtom = atom(true);

const FoodRestrictionToggle = ({ products }: { products: IProduct[] }) => {
  const [allowZeroRemainder, setAllowZeroRemainder] = useAtom(allowZeroRemainderAtom);

  const hasRemainderProducts = products?.some(
    product => product.remainder !== undefined && product.remainder !== null
  ) || false;

  if (!hasRemainderProducts) {
    return null;
  }

  return (
    <TooltipProvider>
    <div className="w-full pb-5 flex items-center justify-end space-x-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Label
            className="flex items-center space-x-2 cursor-pointer"
            htmlFor="printOnlyNew"
          >
            <Checkbox
              id="printOnlyNew"
              checked={allowZeroRemainder}
              onCheckedChange={(checked) => setAllowZeroRemainder(checked === true)}
            />
            <span>Хоол хязгаарлалт</span>
          </Label>
        </TooltipTrigger>
        <TooltipContent>
          <p>Үлдэгдэлийг хянах</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
  );
};

const ProductItem = ({ attachment, name, code, unitPrice, remainder, remainders, _id }: IProduct) => {
  const addToCart = useSetAtom(addToCartAtom);
  const mode = useAtomValue(modeAtom);
  const setTab = useSetAtom(mobileTabAtom);
  const allowZeroRemainder = useAtomValue(allowZeroRemainderAtom);

  const handleAddToCart = () => {
    if (typeof remainder === 'number' && remainder === 0 && !allowZeroRemainder) {  
      toast({
        variant: "destructive",
        description: "Бүтээгдэхүүн хүрэлцэхгүй байна",
        title: "Анхаар",
      });
      return;
    }

        try {  
            addToCart({ name, _id, unitPrice });  
          } catch (error) {  
            toast({  
              variant: "destructive",  
              description: "Сагсанд нэмэх үед алдаа гарлаа",  
              title: "Анхаар",  
            });  
            return;  
          }  

    if (mode === "mobile") {
      toast({
        variant: "default",
        description: `${name} сагсанд нэмэгдлээ`,
        action: (
          <ToastAction altText="Goto cart" onClick={() => setTab("checkout")}>
            Сагс руу очих
          </ToastAction>
        ),
      });
    }
  };

  return (
    <button  
      type="button"  
      aria-label={`Add ${name} to cart`}  
      disabled={remainder === 0 && !allowZeroRemainder}  
      className={`relative rounded-lg border p-3 text-center ${  
        remainder === 0 && !allowZeroRemainder ? "opacity-50" : "cursor-pointer"  
      }`}  
      onClick={handleAddToCart}
      >
      <Image
        src={(attachment || {}).url || ""}
        alt=""
        width={200}
        height={100}
        className="mb-3 aspect-[4/3] h-auto w-full object-contain px-3"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mb-1 h-8 overflow-hidden text-ellipsis text-sm leading-4">
              <small>{`${code} - ${name}`}</small>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div>{`${code} - ${name}`}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="font-extrabold">
        {formatNum(unitPrice)}₮{" "}
        {typeof remainder === "number" && (
          remainders && remainders.length > 1 ? (
            <HoverCard>
              <HoverCardTrigger>{`/${remainder}/`}</HoverCardTrigger>
              <HoverCardContent className="w-48">
                <div className="flex flex-col border border-b-0">
                  {remainders.map(({ location, remainder }) => (
                    <div key={location} className="flex items-center border-b font-semibold">
                      <span className="flex-1 border-r p-1 text-left text-neutral-600">
                        {location}
                      </span>
                      <span className="flex-1 p-1 text-right">{remainder}</span>
                    </div>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <span>{`/${remainder}/`}</span>
          )
        )}
      </p>
    </button>
  );
};

export { ProductItem, FoodRestrictionToggle };