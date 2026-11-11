import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

// not used
export const EditModePositionComponentState = atomFamily((key: string) =>
  atom<boolean>(false),
);
