import { useEffect, useState } from 'react';

export type PopoverPosition = 'left' | 'right' | 'top' | 'bottom';

interface PopoverPositionStyle {
  position: 'fixed';
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  transform?: string;
}

export function usePopoverPosition({
  position = 'bottom',
  inputRef,
  popoverRef,
  isOpen,
}: {
  position?: PopoverPosition;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  popoverRef: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
}) {
  const [positionStyle, setPositionStyle] = useState<PopoverPositionStyle>({
    position: 'fixed',
  });

  useEffect(() => {
    if (!isOpen || !inputRef.current || !popoverRef.current) {
      return;
    }

    const calculatePosition = () => {
      const inputElement = inputRef.current;
      const popoverElement = popoverRef.current;

      if (!inputElement || !popoverElement) return;

      const inputRect = inputElement.getBoundingClientRect();
      const popoverRect = popoverElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spacing = 8; // 8px spacing between input and popover

      let style: PopoverPositionStyle = { position: 'fixed' };

      switch (position) {
        case 'bottom': {
          const top = inputRect.bottom + spacing;
          const left = inputRect.left;
          // Adjust if popover would overflow right edge
          const adjustedLeft = Math.min(
            left,
            viewportWidth - popoverRect.width - 16,
          );
          style.top = top;
          style.left = Math.max(16, adjustedLeft);
          break;
        }
        case 'top': {
          const bottom = viewportHeight - inputRect.top + spacing;
          const left = inputRect.left;
          const adjustedLeft = Math.min(
            left,
            viewportWidth - popoverRect.width - 16,
          );
          style.bottom = bottom;
          style.left = Math.max(16, adjustedLeft);
          break;
        }
        case 'right': {
          const left = inputRect.right + spacing;
          const top = inputRect.top;
          // Adjust if popover would overflow bottom edge
          const adjustedTop = Math.min(
            top,
            viewportHeight - popoverRect.height - 16,
          );
          style.left = left;
          style.top = Math.max(16, adjustedTop);
          break;
        }
        case 'left': {
          const right = viewportWidth - inputRect.left + spacing;
          const top = inputRect.top;
          const adjustedTop = Math.min(
            top,
            viewportHeight - popoverRect.height - 16,
          );
          style.right = right;
          style.top = Math.max(16, adjustedTop);
          break;
        }
      }

      setPositionStyle(style);
    };

    // Use requestAnimationFrame to ensure DOM has updated
    const rafId = requestAnimationFrame(() => {
      calculatePosition();
    });

    // Recalculate on scroll and resize
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [position, inputRef, popoverRef, isOpen]);

  return positionStyle;
}
