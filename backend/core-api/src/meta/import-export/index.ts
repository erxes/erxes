import { startImportExportWorker } from 'erxes-api-shared/core-modules';
import { Express } from 'express';
import { exportConfiguration } from './export';
import { importConfiguration } from './import';

export default async (app: Express) =>
  startImportExportWorker({
    pluginName: 'core',
    config: {
      import: importConfiguration,
      export: exportConfiguration,
    },
    app,
  });
