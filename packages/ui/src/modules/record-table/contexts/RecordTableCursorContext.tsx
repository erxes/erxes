import { createContext } from 'react';
import type { IRecordTableCursorContext } from '../types/RecordTableCursorTypes';

export const RecordTableCursorContext = createContext<IRecordTableCursorContext>(
  {} as IRecordTableCursorContext,
);
