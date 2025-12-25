import mongoose, { Document, Model } from 'mongoose';
import {
  coreModelOrganizations,
  getSaasCoreConnection,
} from '../saas/saas-mongo-connection';
import { getEnv, getSubdomain } from '../utils';
import { connect } from './mongo-connection';
import { createEventDispatcher } from '../../core-modules/common/eventDispatcher';
// Store current context per subdomain so it can be retrieved dynamically
// This is updated every time generateModels is called, even if models are cached
const contextStore = new Map<string, Record<string, any>>();

const generateEventDispatcher =
  (subdomain: string, initialContext?: Record<string, any>) =>
  (pluginName: string, moduleName: string, collectionName: string) => {
    // Store initial context
    if (initialContext) {
      contextStore.set(subdomain, initialContext);
    }

    // getContents retrieves the CURRENT context from the store dynamically
    // This ensures we always get the latest processId, even if models are cached
    const getContext = () => {
      const currentContext =
        contextStore.get(subdomain) || initialContext || {};
      const { user, processId } = currentContext;
      return {
        subdomain,
        processId: processId || '',
        userId: user?._id || '',
      };
    };

    return createEventDispatcher({
      subdomain,
      pluginName,
      moduleName,
      collectionName,
      getContext,
    });
  };

export const createGenerateModels = <IModels>(
  loadClasses: (
    db: mongoose.Connection,
    subdomain: string,
    eventDispatcher?: (
      pluginName: string,
      moduleName: string,
      collectionName: string,
    ) => any,
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
      // CRITICAL: Update context store so eventDispatcher can get current processId
      if (context) {
        contextStore.set(hostnameOrSubdomain, context);
      }

      const eventDispatcher = generateEventDispatcher(
        hostnameOrSubdomain,
        context,
      );
      const models = await loadClasses(
        mongoose.connection,
        hostnameOrSubdomain,
        eventDispatcher,
      );
      return models;
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

      // CRITICAL: Update context store so eventDispatcher can get current processId
      if (context) {
        contextStore.set(subdomain, context);
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

      const eventDispatcher = generateEventDispatcher(subdomain, context);

      const models = await loadClasses(tenantCon, subdomain, eventDispatcher);
      return models;
    };
  }
};
