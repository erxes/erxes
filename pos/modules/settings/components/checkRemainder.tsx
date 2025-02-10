"use client";

import { useAtom } from "jotai";
import { remainderNotificationEnabledAtom } from "@/store";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";

const CheckRemainder = () => {
  const [isEnabled, setIsEnabled] = useAtom(remainderNotificationEnabledAtom);

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setIsEnabled(checked);
    }
  };

  return (
    <Label
      className="w-full pb-5 flex gap-2 items-center cursor-pointer"
      htmlFor="remainder"
    >
      <Checkbox
        id="remainderNotification"
        checked={isEnabled}
        onCheckedChange={handleCheckboxChange}
        aria-labelledby="remainder"
      />
      Хоолны үлдэгдэл хянагч
    </Label>
  );
};

export default CheckRemainder;
