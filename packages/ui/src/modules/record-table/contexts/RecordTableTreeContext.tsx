import { createContext } from 'react';
import { IRecordTableTreeContext } from '../types/RecordTableTreeTypes';

export const RecordTableTreeContext = createContext<IRecordTableTreeContext>(
  {} as IRecordTableTreeContext,
);
