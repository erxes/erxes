import { Router } from 'express';
import { getSubdomain, sendCoreModuleProducer } from 'erxes-api-shared/utils';
import {
  splitType,
  TImportExportProducers,
} from 'erxes-api-shared/core-modules';
import { importTemplates } from '~/modules/import-export/trpc/templates';
import { validateImportConfig } from '~/modules/import-export/utils/validateConfig';

const router: Router = Router();

const parseEntityType = (entityType: string) => {
  if (!entityType || !entityType.includes(':')) {
    throw new Error(
      `Invalid entityType format: "${entityType}". Expected "<plugin>:<module>.<collection>"`,
    );
  }

  const [pluginName, rest] = entityType.split(':');
  const [moduleName, collectionName] = (rest || '').split('.');

  if (!moduleName) {
    throw new Error(`Missing module name in entityType: "${entityType}"`);
  }

  return {
    pluginName,
    moduleName,
    collectionName,
  };
};

const csvEscape = (value: string) => {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

router.get('/import-export/download-template', async (req, res) => {
  const entityType = req.query.entityType;

  if (typeof entityType !== 'string' || !entityType) {
    return res.status(400).send('entityType is required');
  }

  const tpl = importTemplates[entityType];
  const filename = tpl?.filename || 'import-template.csv';

  try {
    const { moduleName, collectionName, pluginName } =
      parseEntityType(entityType);

    const subdomain = getSubdomain(req);

    await validateImportConfig({
      pluginName: pluginName,
      collectionName: collectionName,
      requireGetImportHeaders: true,
      requireInsertImportRows: false,
    });

    const headers = await sendCoreModuleProducer({
      subdomain,
      pluginName: pluginName,
      moduleName: 'importExport',
      method: 'query',
      producerName: TImportExportProducers.GET_IMPORT_HEADERS,
      input: {
        moduleName: moduleName,
        collectionName: collectionName,
      },
      defaultValue: null,
    });

    if (!headers || headers.length === 0) {
      return res.status(404).json({
        error: `No import headers found for "${entityType}". The module may not support imports or the entity type is incorrect.`,
      });
    }

    const csv = `\uFEFF${headers
      .map((header: any) => csvEscape(header?.label || header?.key || ''))
      .join(',')}\n`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csv);
  } catch (e: any) {
    const isValidationError =
      e?.message?.startsWith('Invalid entityType') ||
      e?.message?.startsWith('Missing module name');

    return res.status(isValidationError ? 400 : 500).json({
      error: e?.message || 'Failed to download template',
    });
  }
});

export { router };
