import { useCallback, useRef, useReducer } from 'react';
import useDebouncedCallback, { DebouncedState } from './useDebouncedCallback';

function valueEquality<T>(left: T, right: T): boolean {
  return left === right;
}

function reducer<T>(_: T, action: T) {
  return action;
}

export default function useDebounce<T>(
  value: T,
  delay: number,
  options?: {
    maxWait?: number;
    leading?: boolean;
    trailing?: boolean;
    equalityFn?: (left: T, right: T) => boolean;
  },
): [T, DebouncedState<(value: T) => void>] {
  const eq = (options && options.equalityFn) || valueEquality;

  const [state, dispatch] = useReducer(reducer, value);
  const debounced = useDebouncedCallback(
    useCallback((value: T) => dispatch(value), [dispatch]),
    delay,
    options,
  );
  const previousValue = useRef(value);

  if (!eq(previousValue.current, value)) {
    debounced(value);
    previousValue.current = value;
  }

  return [state as T, debounced];
}
