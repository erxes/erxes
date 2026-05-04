import { atom } from 'jotai';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';

export const addingTagAtom = atom<Partial<ITag> | null>(null);
