import { getExportHeaders, TASK_CONTENT_TYPE } from './import-export/utils';
import type { IModels } from '~/connectionResolvers';

export const documents = {
  types: [{ label: 'Task', contentType: TASK_CONTENT_TYPE }],
};

/** Reuse task export headers for document attributes, including custom properties. */
export const taskDocumentEditorAttributes = async (
  subdomain: string,
  models: IModels,
) => {
  const headers = await getExportHeaders('task', subdomain, models);

  return headers.map(({ key, label }) => ({ value: key, name: label }));
};
