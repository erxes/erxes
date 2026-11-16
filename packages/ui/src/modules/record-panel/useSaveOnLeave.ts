import { useEffect, useRef } from 'react';

/**
 * Saves a description editor when you click or tab anywhere outside it, never while
 * typing. Focus can't be trusted to leave the editor first: closing the image preview
 * or a toolbar menu drops it on the page. An edit that arrives while focus is already
 * outside, such as an upload that finishes after you moved on, saves right away.
 */
export const useSaveOnLeave = ({
  value,
  readonly,
  onSave,
}: {
  value: string;
  readonly?: boolean;
  onSave: (value: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const latest = useRef(value);
  const saved = useRef(value);

  useEffect(() => {
    latest.current = value;
    saved.current = value;
  }, [value]);

  const save = () => {
    if (readonly || latest.current === saved.current) return;

    saved.current = latest.current;
    onSave(latest.current);
  };

  useEffect(() => {
    const leave = (event: Event) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;

      save();
    };

    document.addEventListener('pointerdown', leave, true);
    document.addEventListener('focusin', leave);

    return () => {
      document.removeEventListener('pointerdown', leave, true);
      document.removeEventListener('focusin', leave);
    };
  });

  return {
    containerRef,
    onChange: (next: string) => {
      latest.current = next;

      if (!containerRef.current?.contains(document.activeElement)) save();
    },
  };
};
