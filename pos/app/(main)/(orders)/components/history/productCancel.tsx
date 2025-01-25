import { FormEvent, useState, useEffect } from "react";
import { mutations } from "@/modules/orders/graphql";
import { orderPasswordAtom } from "@/store/config.store";
import { openCancelDialogAtom, paymentDetailAtom } from "@/store/history.store";
import { activeOrderIdAtom, setInitialAtom } from "@/store/order.store";
import { useMutation } from "@apollo/client";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import useFocus from "@/lib/useFocus";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onError } from "@/components/ui/use-toast";
import { totalAmountAtom } from "@/store/cart.store";

type ProductCancelProps = {
  _id: string;
  number: string;
  refetchQueries?: string[];
  onCompleted?: () => void;
  autoShow?: boolean;
};

export const ProductCancelTrigger = ({
  loading,
  _id,
}: {
  loading?: boolean;
  _id: string;
}) => {
  const changeOpen = useSetAtom(openCancelDialogAtom);
  const { cashAmount, mobileAmount, paidAmounts } =
    useAtomValue(paymentDetailAtom) || {};

  const paidTotal =
    (cashAmount || 0) +
    (mobileAmount || 0) +
    (paidAmounts?.reduce((total, el) => el.amount + total, 0) || 0);

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      onClick={() => changeOpen(_id)}
      disabled={loading || paidTotal > 0}
    >
      Устгах
    </DropdownMenuItem>
  );
};

const ProductCancel = ({
  _id,
  number,
  refetchQueries = ["OrdersHistory"],
  onCompleted,
  autoShow = false,
}: ProductCancelProps) => {
  const orderPassword = useAtomValue(orderPasswordAtom);
  const [open, changeOpen] = useAtom(openCancelDialogAtom);
  const activeOrderId = useAtomValue(activeOrderIdAtom);
  const reset = useSetAtom(setInitialAtom);
  const total = useAtomValue(totalAmountAtom);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [ref, setFocus] = useFocus();
  
  const [orderCancel, { loading }] = useMutation(mutations.ordersCancel, {
    variables: { _id: activeOrderId },
    onCompleted: () => {
      changeOpen(null);
      setFocus();
      if (onCompleted) {
        onCompleted();
      }
      reset();
    },
    onError: (error) => {
      onError(error.message);
      changeOpen(null);
      setFocus();
    },
    refetchQueries,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value === orderPassword || !orderPassword) {
      return orderCancel();
    }
    setError(true);
  };

  useEffect(() => {
    if (autoShow && total === 0) {
      changeOpen(_id);
    }
  }, [total, autoShow, _id, changeOpen]);

  const handleCancel = () => {
    changeOpen(null);
   reset()
  };

  return (
    <>
      <AlertDialog
        open={open === _id}
        onOpenChange={() => {
          changeOpen(null);
          setFocus();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Та {number} дугаартай захиалгыг устгахдаа итгэлтэй байна уу?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь таны захиалгийг бүрмөсөн
              устгана.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleSubmit}>
            {orderPassword && (
              <div>
                <Label htmlFor="pass">Нууц үг</Label>
                <Input
                  id="pass"
                  type="password"
                  autoComplete="off"
                  className="block my-1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <div
                  className={
                    error ? "text-destructive" : "text-muted-foreground"
                  }
                >
                  Баталгаажуулах нууц {error && "зөв"} үгээ оруулана уу
                </div>
              </div>
            )}
            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel onClick={handleCancel}>Болих</AlertDialogCancel>
              <Button variant="destructive" type="submit" loading={loading}>
                Устгах
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      <div ref={ref} />
    </>
  );
};

export default ProductCancel;
