import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useSyncedState = <T>(
  source: T,
): readonly [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState(source);

  useEffect(() => {
    setValue(source);
  }, [source]);

  return [value, setValue] as const;
};
