import { createSharedContext } from './sharedContext';
import type { IRecordTableContext } from '../types/recordTableTypes';

export const RecordTableContext =
  createSharedContext<IRecordTableContext | null>('RecordTable', null);
