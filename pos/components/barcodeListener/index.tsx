import React, { useCallback, useEffect, useState } from "react";
import { barcodeAtom } from "@/store/barcode.store";
import { disableBarcodeAtom } from "@/store/ui.store";
import { differenceInMilliseconds } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";

interface BarcodeListenerProps {
  children: React.ReactNode;
  threshold?: number;
  minBarcodeLength?: number;
  onScan?: (barcode: string) => void;
  maxLength?: number;
}

const BarcodeListener = ({
  children,
  threshold = 100,
  minBarcodeLength = 5,
  maxLength = 50,
  onScan,
}: BarcodeListenerProps) => {
  const [value, setValue] = useState("");
  const [lastKeyPressTime, setLastKeyPressTime] = useState<number>(0);
  const disableBarcode = useAtomValue(disableBarcodeAtom);
  const setBarcode = useSetAtom(barcodeAtom);

  const handleKeyPress = useCallback(
    ({ key }: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyPressTime;
      const isContinuousInput = timeDiff < threshold;

      if (key.length === 1 && value.length < maxLength) {
        setValue(prev => isContinuousInput ? prev + key : key);
        setLastKeyPressTime(currentTime);
        return;
      }

      if (key === "Enter" && value.length >= minBarcodeLength) {
        setBarcode(value);
        onScan?.(value);
        setValue("");
        setLastKeyPressTime(0);
      }
    },
    [lastKeyPressTime, threshold, value, minBarcodeLength, maxLength, setBarcode, onScan]
  );

  useEffect(() => {
    if (!disableBarcode) {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [handleKeyPress, disableBarcode]);

  return <>{children}</>;
};

export default BarcodeListener;