import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';

import {
  IRfidTagDocument,
  IScanSessionDocument,
  IStorageMovementDocument,
  IStorageZoneDocument,
} from '@/storage/@types/storage';
import { IMovementModel, loadMovementClass } from '@/storage/db/models/Movements';
import { IRfidTagModel, loadRfidTagClass } from '@/storage/db/models/RfidTags';
import { IScanSessionModel, loadScanSessionClass } from '@/storage/db/models/ScanSessions';
import { IZoneModel, loadZoneClass } from '@/storage/db/models/Zones';

export interface IModels {
  Zones: IZoneModel;
  RfidTags: IRfidTagModel;
  Movements: IMovementModel;
  ScanSessions: IScanSessionModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  const models = {} as IModels;

  models.Zones = db.model<IStorageZoneDocument, IZoneModel>(
    'storage_zones',
    loadZoneClass(models, subdomain),
  );

  models.RfidTags = db.model<IRfidTagDocument, IRfidTagModel>(
    'storage_rfid_tags',
    loadRfidTagClass(models, subdomain),
  );

  models.Movements = db.model<IStorageMovementDocument, IMovementModel>(
    'storage_movements',
    loadMovementClass(models, subdomain),
  );

  models.ScanSessions = db.model<IScanSessionDocument, IScanSessionModel>(
    'storage_scan_sessions',
    loadScanSessionClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
