import { randomUUID } from 'crypto';
import {
  getEnv,
  getSaasOrganizationIdBySubdomain,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/** Config code of the self-hosted installation's permanent id. */
export const INSTALLATION_ID_CODE = 'INSTALLATION_ID';

const isDuplicateKey = (error: unknown) =>
  (error as { code?: number } | null)?.code === 11000;

/**
 * The permanent id of the organisation a subdomain belongs to, for services
 * that key their own data by organisation (subdomains can be renamed).
 * SaaS: the organisation's `_id`. Self-hosted: one installation id, created
 * once and kept in configs, whatever address the request came through.
 */
export const getOrganizationId = async (
  models: IModels,
  subdomain: string,
): Promise<string> => {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    return String(await getSaasOrganizationIdBySubdomain(subdomain));
  }

  const existing = await models.Configs.findOne({
    code: INSTALLATION_ID_CODE,
  }).lean();

  if (existing?.value) {
    return String(existing.value);
  }

  try {
    await models.Configs.create({
      code: INSTALLATION_ID_CODE,
      value: randomUUID(),
    });
  } catch (error) {
    // Another request created it first (`code` is unique): use theirs
    if (!isDuplicateKey(error)) {
      throw error;
    }
  }

  const created = await models.Configs.findOne({
    code: INSTALLATION_ID_CODE,
  }).lean();

  return String(created?.value);
};
