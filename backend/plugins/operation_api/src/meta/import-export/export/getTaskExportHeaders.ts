import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getExportHeaders } from '../utils';

/**
 * Retrieves and returns the list of export header definitions for tasks.
 *
 * @param _data Unused parameter containing request arguments.
 * @param context The import/export context containing subdomain.
 * @returns A promise resolving to an array of import/export header definitions.
 */
export const getTaskExportHeaders = (
  _data: unknown,
  { subdomain }: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> => getExportHeaders('task', subdomain);
