import { createContext } from 'react';

import { ISelectTagsContext } from '../types/Tag';

export const SelectTagsContext = createContext<ISelectTagsContext | null>(null);
