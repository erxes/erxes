import { keyedAtom } from 'erxes-ui/lib/keyed-atom';

export const activeCardIdState = keyedAtom<string | null>(null);

export const dragOverBoardColumnIdState = keyedAtom<string | null>(null);
