import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { RecordSidePanel } from 'ui-modules';

/** Hosts settings content in a local panel with focus and Escape handling. */
export const SettingsLocalPanel = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) => {
  const [width, setWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const container = containerRef.current;
    container
      ?.querySelector<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])',
      )
      ?.focus();
    return () => {
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        (container?.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        previousFocus.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    /** Closes the panel on Escape when no nested overlay handles it. */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"][data-state="open"]',
        )
      ) {
        return;
      }
      event.preventDefault();
      onOpenChange(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {createPortal(
        <div ref={containerRef} className="contents">
          <RecordSidePanel
            className="fixed bottom-0 right-0 top-12 z-40 shadow-lg"
            width={width}
            onWidthChange={setWidth}
          >
            {children}
          </RecordSidePanel>
        </div>,
        document.body,
      )}
    </>
  );
};
