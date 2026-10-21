import { IModels } from '~/connectionResolvers';
import { getConfig } from '~/modules/organization/settings/utils/configs';
import { FILES_DEFAULT_MAX_FILE_SIZE_MB } from '@/files/constants';

export const MB = 1024 * 1024;

export const getFilesMaxFileSize = async (models: IModels) => {
  const mb = Number(await getConfig('FILES_MAX_FILE_SIZE_MB', '', models));

  return (Number.isFinite(mb) && mb > 0 ? mb : FILES_DEFAULT_MAX_FILE_SIZE_MB) * MB;
};
