import { atom, type PrimitiveAtom } from 'jotai';
import { atomFamily } from 'jotai-family';

/** One writable atom per key (a record id, a filter id), each starting at `initial`. */
export const keyedAtom = <Value>(initial: Value) =>
  atomFamily<string, PrimitiveAtom<Value>>(() => atom(initial));
