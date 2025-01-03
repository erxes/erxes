import React, { useCallback, useEffect, useState } from "react";
import { barcodeAtom } from "@/store/barcode.store";
import { disableBarcodeAtom } from "@/store/ui.store";
import { differenceInMilliseconds } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";

interface BarcodeListenerProps {
  children: React.ReactNode;
  threshold?: number; // Max time in ms between key presses to consider continuous input
  minBarcodeLength?: number; // Minimum barcode length to submit
}

const BarcodeListener = ({
  children,
  threshold = 100,
  minBarcodeLength = 5,
}: BarcodeListenerProps) => {
  const [value, setValue] = useState("");
  const [lastKeyPressDate, setLastKeyPressDate] = useState<Date | null>(null);
  const disableBarcode = useAtomValue(disableBarcodeAtom);
  const setBarcode = useSetAtom(barcodeAtom);

  const handleKeyPress = useCallback(
    ({ key }: KeyboardEvent) => {
      const currentDate = new Date();

      // Calculate time difference since the last key press
      const isContinuousInput =
        lastKeyPressDate &&
        differenceInMilliseconds(currentDate, lastKeyPressDate) < threshold;

      if (key.length === 1) {
        // Add to the barcode value or reset if input is not continuous
        setValue((prev) => (isContinuousInput ? prev + key : key));
        setLastKeyPressDate(currentDate);
        return;
      }

      if (key === "Enter" && value.length >= minBarcodeLength) {
        // Submit the barcode and reset the input
        setBarcode(value);
        setValue("");
      }else if (key === "Enter") {
        // Reset the input if it's not continuous or too short
        setValue("");
      }
    },
    [lastKeyPressDate, threshold, value, minBarcodeLength, setBarcode]
  );

  useEffect(() => {
    if (disableBarcode) return;

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, disableBarcode]);

  return <>{children}</>;
};

export default BarcodeListener;
