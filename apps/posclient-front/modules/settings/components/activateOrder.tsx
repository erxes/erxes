"use client";

import { useAtom } from "jotai";
import { orderNotificationEnabledAtom } from "@/store";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";


const ActivateOrderQr = () => {
  const [isEnabled, setIsEnabled] = useAtom(orderNotificationEnabledAtom);
  const handleCheckboxChange = (checked: boolean) => {
    setIsEnabled(checked);
  };

  return (
    <Label
      className="w-full pb-5 flex gap-2 items-center cursor-pointer"
      htmlFor="orderNotification"
    >
      <Checkbox
        id="orderNotification"
        checked={isEnabled}
        onCheckedChange={handleCheckboxChange}
      />
        QR мэню идэвхтэй
    </Label>
  );
};

export default ActivateOrderQr;