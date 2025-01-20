import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import documents from './documents';
import forms from './forms';
import imports from './imports';
import exporter from './exporter';
import logs from './logUtils';
import * as permissions from './permissions';
import * as cookieParser from 'cookie-parser';
import payment from './payment';
import reports from './reports';
import { checkContractPeriod } from './cronjobs/contractCronJobs';
import { getSubdomain } from '@erxes/api-utils/src/core';
import app from '@erxes/api-utils/src/app';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import userMiddleware from '@erxes/api-utils/src/middlewares/user';
import cpUserMiddleware from '@erxes/api-utils/src/middlewares/clientportal';
import { can } from '@erxes/api-utils/src/permissions';
import { buildFile } from './utils';

interface IConfig {
  name: string;
  permissions: any;
  graphql: Function;

  apolloServerContext: any;

  onServerInit: any;
  meta: {
    logs: any;
    cronjobs: {
      handleDailyJob: any;
      handleMinutelyJob: any;
    };
    documents: any;
    permissions: any;
    forms: any;
    imports: any;
    exporter: any;
    payment: any;
  };
}

export default {
  name: 'loans',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  middlewares: [cookieParser(), userMiddleware, cpUserMiddleware],

  onServerInit: async () => {
    app.get(
      '/transactions-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;
        if (!req.user && !req.cpUser) {
          return res.status(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        if (!query.contractId) {
          return res.status(400).send({
            success: false,
            error: 'Missing parameters',
          });
        }

        const subdomain = getSubdomain(req);

        let filter: any = {
          contractId: query.contractId,
        };

        if (req.user) {
          // check permissions

          let allowed = await can(
            subdomain,
            'showTransactions',
            req.user
          );

          if (req.user.isOwner) {
            allowed = true;
          }

          if (!allowed) {
            return res.status(403).send({
              success: false,
              error: 'Permission required',
            });
          }
        }

        const models = await generateModels(subdomain);

        const contract = await models.Contracts.findOne({
          _id: query.contractId,
        });

        if (!contract) {
          return res.status(404).send({
            success: false,
            error: 'Contract not found',
          });
        }

        if (req.cpUser && contract.customerId !== req.cpUser.erxesCustomerId) {
          return res.status(404).send({
            success: false,
            error: 'Contract not found',
          });
        }

        if (query.startDate && query.endDate) {
          filter.payDate = {
            $gte: new Date(query.startDate),
            $lte: new Date(query.endDate),
          };
        } else {
          // get last 30 days
          filter.payDate = {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          };
        }

        const data = await models.Transactions.find(filter)
          .sort({ payDate: -1 })
          .lean();

        if (!data || !data.length) {
          return res.status(404).send({
            success: false,
            error: 'Transactions not found',
          });
        }

        const result = await buildFile(data);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      })
    );
  },
  setupMessageConsumers,
  meta: {
    logs: { consumers: logs },
    cronjobs: {
      handleMinutelyJob: checkContractPeriod,
    },
    documents,
    permissions,
    forms,
    imports,
    exporter,
    payment,
  },
};
