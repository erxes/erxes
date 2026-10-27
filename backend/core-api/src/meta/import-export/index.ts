import {
  mountImportExportRoute,
  startImportExportWorkers,
} from 'erxes-api-shared/core-modules';
import { Express } from 'express';
import { exportConfiguration } from './export';
import { importConfiguration } from './import';

const IMPORT_EXPORT = {
  pluginName: 'core',
  config: {
    import: importConfiguration,
    export: exportConfiguration,
  },
};

export const initImportExportRoute = (app: Express) =>
  mountImportExportRoute({ ...IMPORT_EXPORT, app });

export const startImportExportQueueWorkers = () =>
  startImportExportWorkers(IMPORT_EXPORT);
