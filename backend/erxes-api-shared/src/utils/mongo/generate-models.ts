import mongoose from 'mongoose';
import {
  coreModelOrganizations,
  getSaasCoreConnection,
} from '../saas/saas-mongo-connection';
import { isEnabled } from '../service-discovery';
import { checkServiceRunning, getEnv, getSubdomain } from '../utils';
import { startChangeStreams } from './change-stream';
import { connect } from './mongo-connection';

const initializeModels = async <IModels>(
  connection: mongoose.Connection,
  loadClasses: (
    db: mongoose.Connection,
    subdomain: string,
  ) => IModels | Promise<IModels>,
  subdomain: string,
  logIgnoreOptions?: {
    ignoreChangeStream?: boolean;
    ignoreModels?: string[];
  },
) => {
  const models = await loadClasses(connection, subdomain);
  if (
    !logIgnoreOptions?.ignoreChangeStream &&
    (await checkServiceRunning('logs'))
  ) {
    startChangeStreams(models as any, subdomain, logIgnoreOptions);
  }

  return models;
};

export const createGenerateModels = <IModels>(
  loadClasses: (
    db: mongoose.Connection,
    subdomain: string,
  ) => IModels | Promise<IModels>,
  logIgnoreOptions?: {
    ignoreChangeStream?: boolean;
    ignoreModels?: string[];
  },
): ((hostnameOrSubdomain: string) => Promise<IModels>) => {
  const VERSION = getEnv({ name: 'VERSION', defaultValue: 'os' });

  connect();

  if (VERSION && VERSION !== 'saas') {
    let models: IModels | null = null;
    return async function genereteModels(
      hostnameOrSubdomain: string,
    ): Promise<IModels> {
      if (models) {
        return models;
      }

      return initializeModels(
        mongoose.connection,
        loadClasses,
        hostnameOrSubdomain,
        logIgnoreOptions,
      );
    };
  } else {
    return async function genereteModels(
      hostnameOrSubdomain = '',
    ): Promise<IModels> {
      let subdomain: string = hostnameOrSubdomain;

      if (!subdomain) {
        throw new Error(`Subdomain is \`${subdomain}\``);
      }

      // means hostname
      if (subdomain && subdomain.includes('.')) {
        subdomain = getSubdomain(hostnameOrSubdomain);
      }

      await getSaasCoreConnection();

      const organization = await coreModelOrganizations.findOne({ subdomain });

      if (!organization) {
        throw new Error(
          `Organization with subdomain = ${subdomain} is not found`,
        );
      }

      const DB_NAME = getEnv({ name: 'DB_NAME' });
      const GE_MONGO_URL = (DB_NAME || 'erxes_<organizationId>').replace(
        '<organizationId>',
        organization._id,
      );

      const tenantCon = mongoose.connection.useDb(GE_MONGO_URL, {
        // so that conn.model method can use cached connection
        useCache: true,
        noListener: true,
      });

      return initializeModels(
        tenantCon,
        loadClasses,
        subdomain,
        logIgnoreOptions,
      );
    };
  }
};
