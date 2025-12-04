import { useEffect, useState } from 'react';

export function useSecondTick() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(i);
  }, []);

  return tick;
}
