import { useEffect, useRef, useState } from 'react';
import { IMutateCallbacks } from '../types/fieldsTypes';

export type TFieldSaveState = 'idle' | 'saving' | 'saved';

const SAVED_VISIBLE_MS = 2000;

// What a field shows about its last save; only hooks that report back can say "saved".
export const useFieldSaveState = (loading: boolean) => {
  const [saveState, setSaveState] = useState<TFieldSaveState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!loading) {
      setSaveState((current) => (current === 'saving' ? 'idle' : current));
    }
  }, [loading]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const startSave = (): IMutateCallbacks => {
    clearTimeout(timerRef.current);
    setSaveState('saving');

    return {
      onCompleted: () => {
        setSaveState('saved');
        timerRef.current = setTimeout(
          () => setSaveState('idle'),
          SAVED_VISIBLE_MS,
        );
      },
      onError: () => setSaveState('idle'),
    };
  };

  return { saveState, startSave };
};
