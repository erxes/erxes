import { useRef, useState } from 'react';

// A cell editor keeps what was typed when it closes; only Escape takes it back.
export const useInlineCellEdit = <T>(
  initial: T,
  value: unknown,
  handleChange: (next: T) => void,
) => {
  const [currentValue, setCurrentValue] = useState<T>(initial);
  const cancelledRef = useRef(false);

  const onOpenChange = (open: boolean) => {
    if (open) {
      cancelledRef.current = false;
      return;
    }

    if (cancelledRef.current) {
      setCurrentValue(initial);
      return;
    }

    if (currentValue !== value) {
      handleChange(currentValue);
    }
  };

  // Radix reports Escape before it closes, so the close knows to discard.
  const onEscapeKeyDown = () => {
    cancelledRef.current = true;
  };

  return { currentValue, setCurrentValue, onOpenChange, onEscapeKeyDown };
};
