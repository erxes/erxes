import { createContext } from 'react';
import { IRecordTableCursorContext } from '../types/RecordTableCursorTypes';

export const RecordTableCursorContext =
  createContext<IRecordTableCursorContext>({} as IRecordTableCursorContext);
