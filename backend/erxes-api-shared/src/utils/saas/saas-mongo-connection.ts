import mongoose from 'mongoose';
import { getEnv } from '../utils';
import {
  saasAddonSchema,
  saasBundleSchema,
  endPointSchema,
  experiencesSchema,
  saasInstallationSchema,
  saasOrganizationsSchema,
  saasPluginSchema,
  saasPromoCodeSchema,
  saasUserSchema,
} from './definition';
import { IOrganization } from './types';
import { redis } from '../redis';
import { mongooseConnectionOptions } from '../mongo';

export let coreModelOrganizations: any;
export let coreModelAddons: any;
export let coreModelBundles: any;
export let coreModelInstallations: any;
export let coreModelUsers: any;
export let coreModelEndpoints: any;
export let coreModelPromoCodes: any;
export let coreModelPlugins: any;
export let coreModelExperiences: any;

export const getSaasCoreConnection = async (): Promise<void> => {
  if (coreModelOrganizations) {
    return;
  }

  const CORE_MONGO_URL = getEnv({ name: 'CORE_MONGO_URL' });

  const coreConnection = await mongoose.createConnection(
    CORE_MONGO_URL,
    mongooseConnectionOptions,
  );

  coreModelOrganizations = coreConnection.model(
    'organizations',
    saasOrganizationsSchema,
  );

  coreModelInstallations = coreConnection.model(
    'installations',
    saasInstallationSchema,
  );
  coreModelExperiences = coreConnection.model('experiences', experiencesSchema);
  coreModelUsers = coreConnection.model('users', saasUserSchema);
  coreModelEndpoints = coreConnection.model('endpoints', endPointSchema);
  coreModelPromoCodes = coreConnection.model(
    'promo_codes',
    saasPromoCodeSchema,
  );
  coreModelAddons = coreConnection.model('addons', saasAddonSchema);
  coreModelBundles = coreConnection.model('bundles', saasBundleSchema);
  coreModelPlugins = coreConnection.model('plugins', saasPluginSchema);
};

export const ORGANIZATION_ID_MAPPING: { [key: string]: string } = {};

export const getSaasOrganizationIdBySubdomain = async (
  subdomain: string,
): Promise<string> => {
  if (ORGANIZATION_ID_MAPPING[subdomain]) {
    return ORGANIZATION_ID_MAPPING[subdomain];
  }

  await getSaasCoreConnection();

  const organization = await getSaasOrgsCache({ subdomain });

  if (!organization) {
    throw new Error(`Invalid host, subdomain: ${subdomain}`);
  }

  ORGANIZATION_ID_MAPPING[subdomain] = organization._id;

  return ORGANIZATION_ID_MAPPING[subdomain];
};

export const getSaasOrgsCache = async ({
  subdomain,
  excludeSubdomains,
  domain,
}: {
  subdomain?: string;
  excludeSubdomains?: string[];
  domain?: string;
}): Promise<any> => {
  const value = await redis.get('core_organizations');

  let organizations: IOrganization[] = value ? JSON.parse(value) : [];

  if (organizations.length === 0) {
    organizations = await coreModelOrganizations.find({}).lean();

    redis.set('core_organizations', JSON.stringify(organizations));
  }

  if (subdomain) {
    return organizations.find((org) => org.subdomain === subdomain);
  }

  if (excludeSubdomains) {
    return organizations.filter(
      (org) => !excludeSubdomains.includes(org.subdomain),
    );
  }

  if (domain) {
    return organizations.find((org) => org.domain === domain);
  }

  return organizations;
};

export const getSaasOrganizations = async (email?: string) => {
  await getSaasCoreConnection();

  if (email) {
    return coreModelOrganizations.find({ ownerEmail: email });
  }

  return coreModelOrganizations.find({});
};

export const getSaasOrganizationsByFilter = async (filter: any) => {
  await getSaasCoreConnection();

  if (filter) {
    return coreModelOrganizations.find(filter);
  }

  return coreModelOrganizations.find({});
};

export const updateSaasOrganization = async (
  subdomain: string,
  update: object,
) => {
  await getSaasCoreConnection();

  return coreModelOrganizations.updateOne({ subdomain }, { $set: update });
};

export const getSaasOrganizationDetail = async ({
  subdomain,
}: {
  subdomain: string;
  models?: any;
}) => {
  await getSaasCoreConnection();

  const organization = await coreModelOrganizations
    .findOne({ subdomain })
    .lean();

  if (!organization) {
    return {};
  }

  const charge = organization.charge || {};
  let experienceName = '';
  const bundleNames = [] as string[];
  const setupService: Record<string, boolean> = {};

  const installation = await coreModelInstallations.findOne({
    organizationId: organization._id,
  });

  if (installation) {
    const plugins = await getSaasPlugins({});
    const addons = await coreModelAddons.find(
      {
        installationId: installation._id.toString(),
        expiryDate: { $gt: new Date() },
        paymentStatus: { $in: ['complete', 'canceled'] },
      },
      { quantity: 1, kind: 1 },
    );

    const bundleTypes = await coreModelBundles.find({}).distinct('type').lean();

    const activeBundles = await coreModelAddons
      .find({
        installationId: installation._id.toString(),
        kind: { $in: bundleTypes },
        paymentStatus: { $in: ['complete', 'canceled'] },
        expiryDate: { $gt: new Date() },
      })
      .lean();

    for (const activeBundle of activeBundles) {
      const bundle = await coreModelBundles.findOne({
        type: activeBundle.kind,
      });

      bundleNames.push(bundle.title);
    }

    for (const plugin of plugins) {
      let purchased = 0;
      let quantity = 0;
      let free = charge[plugin.type] ? charge[plugin.type].free || 0 : 0;
      let bundleAmount = 0;

      if (activeBundles && activeBundles.length > 0) {
        for (const activeBundle of activeBundles) {
          const bundle = await coreModelBundles.findOne({
            type: activeBundle.kind,
          });

          if (bundle) {
            bundleAmount = bundle.pluginLimits
              ? bundle.pluginLimits[plugin.type] || 0
              : 0;
          }
        }
      }

      addons
        .filter((addon: any) => addon.kind === plugin.type)
        .forEach((addon: any) => {
          quantity += addon.quantity || 0;
        });

      if (organization && organization.experienceId) {
        const experience = await coreModelExperiences.findOne({
          _id: organization.experienceId,
        });

        if (experience) {
          experienceName = experience.title;
          free =
            free +
            (experience.pluginLimits
              ? experience.pluginLimits[plugin.type] || 0
              : 0);
        }
      }

      purchased = quantity + (bundleAmount || 0) / (plugin.count || 1);

      charge[plugin.type] = {
        ...charge[plugin.type],
        free,
        purchased,
      };
    }

    const setupAddons = await coreModelAddons.find(
      {
        installationId: installation._id.toString(),
        paymentStatus: 'complete',
        kind: 'setupService',
      },
      { subkind: 1 },
    );

    for (const addon of setupAddons) {
      setupService[addon.subkind] = true;
    }
  }

  return {
    ...organization,
    experienceName,
    bundleNames,
    charge,
    setupService,
  };
};

export const removeOrgsCache = (source: string) => {
  console.log(`Removing org cache ${source}`);

  return redis.set('core_organizations', '');
};

export const getSaasPlugins = async (query: any = {}) => {
  await getSaasCoreConnection();

  return coreModelPlugins.find(query).lean();
};

export const getSaasPlugin = async (query: any = {}) => {
  await getSaasCoreConnection();

  return coreModelPlugins.findOne(query).lean();
};

export const getSaasPromoCodes = async (query: any = {}) => {
  await getSaasCoreConnection();

  return coreModelPromoCodes.find(query).lean();
};

export const getSaasOrgPromoCodes = async ({
  promoCodes = [],
}: IOrganization) => {
  if (!promoCodes.length) {
    return [];
  }

  return getSaasPromoCodes({
    code: { $in: promoCodes },
  });
};
