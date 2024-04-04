import { model } from 'mongoose';
import { loadZmsClass, xmlZmsSchema } from './xmlZmsModel';
import { loadZmsLogClass, zmsLogSchema } from './zmsLogsModel';
import {
  loadZmsDictionaryClass,
  zmsDictionarySchema
} from './zmsDictionaryModel';

export const ZmsDictionaries = model<any, any>(
  'zmsDictionary',
  zmsDictionarySchema
);

export const ZmsLogs = model<any, any>('zmsLog', zmsLogSchema);

export const Zmss = model<any, any>('zmss', xmlZmsSchema);

loadZmsClass();
loadZmsLogClass();
loadZmsDictionaryClass();
