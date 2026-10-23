import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getConfig } from '~/modules/organization/settings/utils/configs';

export const isSaas = () => getEnv({ name: 'VERSION' }) === 'saas';

// SaaS storage runs on platform credentials, so a tenant-written config must not steer it.
export const getFilesConfig = async (
  code: string,
  defaultValue: string,
  models: IModels,
): Promise<string> =>
  isSaas()
    ? getEnv({ name: code, defaultValue })
    : getConfig(code, defaultValue, models);
