import { startTransition, useEffect, useMemo, useState } from 'react';

const PROGRESSIVE_BATCH_SIZE = 20;

export const useProgressiveRows = <T>(rows: T[], resetKey?: string) => {
  const [progress, setProgress] = useState({
    key: resetKey,
    count: PROGRESSIVE_BATCH_SIZE,
  });

  if (progress.key !== resetKey) {
    setProgress({ key: resetKey, count: PROGRESSIVE_BATCH_SIZE });
  }

  const count =
    progress.key === resetKey ? progress.count : PROGRESSIVE_BATCH_SIZE;
  const isComplete = count >= rows.length;

  useEffect(() => {
    if (isComplete) return;

    const frame = requestAnimationFrame(() =>
      startTransition(() =>
        setProgress((current) => ({
          ...current,
          count: current.count + PROGRESSIVE_BATCH_SIZE,
        })),
      ),
    );

    return () => cancelAnimationFrame(frame);
  }, [count, isComplete]);

  return useMemo(
    () => (isComplete ? rows : rows.slice(0, count)),
    [rows, count, isComplete],
  );
};
