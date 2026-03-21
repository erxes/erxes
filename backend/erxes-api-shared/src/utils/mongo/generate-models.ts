import { createScopedEventHandlers } from '../../core-modules/common/eventHandlers/generateEventHandlers';
import mongoose, { Connection } from 'mongoose';
import {
  coreModelOrganizations,
  getSaasCoreConnection,
} from '../saas/saas-mongo-connection';
import { getEnv, getSubdomain } from '../utils';
import { connect } from './mongo-connection';
import type { ScopedEventHandlers } from '../../core-modules/common/eventHandlers/types';

const returnGeneratedModels = async <IModels>(
  connection: Connection,
  loadClasses: (
    db: mongoose.Connection,
    subdomain: string,
    eventHandlers?: ScopedEventHandlers,
  ) => IModels | Promise<IModels>,
  subdomain: string,
  context?: Record<string, any>,
) => {
  const eventHandlers = createScopedEventHandlers(subdomain, context);
  return await loadClasses(connection, subdomain, eventHandlers);
};

export const createGenerateModels = <IModels>(
  loadClasses: (
    db: mongoose.Connection,
    subdomain: string,
    eventHandlers?: ScopedEventHandlers,
  ) => IModels | Promise<IModels>,
): ((
  hostnameOrSubdomain: string,
  context?: Record<string, any>,
) => Promise<IModels>) => {
  const VERSION = getEnv({ name: 'VERSION', defaultValue: 'os' });

  connect();

  if (VERSION && VERSION !== 'saas') {
    return async function genereteModels(
      hostnameOrSubdomain: string,
      context?: Record<string, any>,
    ): Promise<IModels> {
      return await returnGeneratedModels(
        mongoose.connection,
        loadClasses,
        hostnameOrSubdomain,
        context,
      );
    };
  } else {
    return async function genereteModels(
      hostnameOrSubdomain = '',
      context?: Record<string, any>,
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

      return await returnGeneratedModels(
        tenantCon,
        loadClasses,
        subdomain,
        context,
      );
    };
  }
};
