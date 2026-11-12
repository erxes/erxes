import { createContext } from 'react';
import type { IRecordTableTreeContext } from '../types/RecordTableTreeTypes';

export const RecordTableTreeContext = createContext<IRecordTableTreeContext>(
  {} as IRecordTableTreeContext,
);
