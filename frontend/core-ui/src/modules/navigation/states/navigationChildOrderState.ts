import { atomWithStorage } from 'jotai/utils';

export const navigationChildOrderState = atomWithStorage<
  Record<string, string[]>
>('navigation:child-order', {}, undefined, { getOnInit: true });
