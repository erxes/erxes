import { useEffect, useRef, useState } from 'react';
import { AssistantAvatar } from './AssistantAvatar';

const HOLD_MS = 1500;

const useSteadyLabel = (label: string) => {
  const [shown, setShown] = useState(label);
  const since = useRef(0);

  useEffect(() => {
    since.current = performance.now();
  }, []);

  useEffect(() => {
    if (label === shown) return undefined;

    const timer = setTimeout(
      () => {
        since.current = performance.now();
        setShown(label);
      },
      Math.max(0, since.current + HOLD_MS - performance.now()),
    );

    return () => clearTimeout(timer);
  }, [label, shown]);

  return shown;
};

export const ThinkingLine = ({ label }: { label: string }) => {
  const shown = useSteadyLabel(label);

  return (
    <span className="flex min-w-0 items-center gap-2 text-sm">
      <AssistantAvatar size={20} state="thinking" />
      <span key={shown} className="flex min-w-0 animate-in fade-in slide-in-from-bottom-1">
        <span className="min-w-0 truncate shimmer-text">{shown}</span>
      </span>
    </span>
  );
};
