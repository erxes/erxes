import * as mongoose from 'mongoose';
import { connectionOptions, getEnv } from '../core';
import {
  addonSchema,
  bundleSchema,
  endPointSchema,
  experiencesSchema,
  installationSchema,
  organizationsSchema,
  pluginSchema,
  promoCodeSchema,
  userSchema,
} from './definition';
import { IOrganization } from './types';
import redis from '../redis';

export let coreModelOrganizations;
export let coreModelAddons;
export let coreModelBundles;
export let coreModelInstallations;
export let coreModelUsers;
export let coreModelEndpoints;
export let coreModelPromoCodes;
export let coreModelPlugins;
export let coreModelExperiences;

export const getCoreConnection = async (): Promise<void> => {
  if (coreModelOrganizations) {
    return;
  }

  const CORE_MONGO_URL = getEnv({ name: 'CORE_MONGO_URL' });

  const coreConnection = await mongoose.createConnection(
    CORE_MONGO_URL,
    connectionOptions,
  );

  coreModelOrganizations = coreConnection.model(
    'organizations',
    organizationsSchema,
  );

  coreModelInstallations = coreConnection.model(
    'installations',
    installationSchema,
  );
  coreModelExperiences = coreConnection.model('experiences', experiencesSchema);
  coreModelUsers = coreConnection.model('users', userSchema);
  coreModelEndpoints = coreConnection.model('endpoints', endPointSchema);
  coreModelPromoCodes = coreConnection.model('promo_codes', promoCodeSchema);
  coreModelAddons = coreConnection.model('addons', addonSchema);
  coreModelBundles = coreConnection.model('bundles', bundleSchema);
  coreModelPlugins = coreConnection.model('plugins', pluginSchema);
};

export let ORGANIZATION_ID_MAPPING: { [key: string]: string } = {};

export const getOrganizationIdBySubdomain = async (
  subdomain: string,
): Promise<string> => {
  if (ORGANIZATION_ID_MAPPING[subdomain]) {
    return ORGANIZATION_ID_MAPPING[subdomain];
  }

  await getCoreConnection();

  const organization = await getOrgsCache({ subdomain });

  if (!organization) {
    throw new Error(`Invalid host, subdomain: ${subdomain}`);
  }

  ORGANIZATION_ID_MAPPING[subdomain] = organization._id;

  return ORGANIZATION_ID_MAPPING[subdomain];
};

export const getOrgsCache = async ({
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
    console.log('Fetching organizations from database ...');

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

export const getOrganizations = async (email?: string) => {
  await getCoreConnection();

  if (email) {
    return coreModelOrganizations.find({ ownerEmail: email });
  }

  return coreModelOrganizations.find({});
};

export const getOrganizationDetail = async ({
  subdomain,
}: {
  subdomain: string;
  models?: any;
}) => {
  await getCoreConnection();

  const organization = await coreModelOrganizations
    .findOne({ subdomain })
    .lean();

  if (!organization) {
    return {};
  }

  const charge = organization.charge || {};
  let experienceName = '';
  let bundleNames = [] as string[];

  const installation = await coreModelInstallations.findOne({
    organizationId: organization._id,
  });

  const setupService = {};

  if (installation) {
    const plugins = await getPlugins({});
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
        .filter((addon) => addon.kind === plugin.type)
        .forEach((addon) => {
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

export const getPlugins = async (query: any = {}) => {
  await getCoreConnection();

  return coreModelPlugins.find(query).lean();
};

export const getPlugin = async (query: any = {}) => {
  await getCoreConnection();

  return coreModelPlugins.findOne(query).lean();
};

export const getPromoCodes = async (query: any = {}) => {
  await getCoreConnection();

  return coreModelPromoCodes.find(query).lean();
};

export const getOrgPromoCodes = async ({ promoCodes = [] }: IOrganization) => {
  if (!promoCodes.length) {
    return [];
  }

  return getPromoCodes({
    code: { $in: promoCodes },
  });
};
