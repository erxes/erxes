import { getSubdomain, startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from '~/apollo/resolvers';
import { generateModels, IModels } from '~/connectionResolvers';
import templateManager from './modules/insurance/services/templateManager';
import { PdfGenerator } from './modules/insurance/services/pdfGenerator';
import * as jwt from 'jsonwebtoken';

startPlugin({
  name: 'insurance',
  port: 33010,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context, req) => {
    const models = await generateModels(subdomain);

    context.models = models;

    // Try to decode vendor JWT token from Authorization header
    // This handles the case where vendorUserLogin token is used instead of erxes core token
    const authHeader = req?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const JWT_SECRET = process.env.JWT_TOKEN_SECRET;

        if (!JWT_SECRET) {
          throw new Error('JWT token secret is not defined');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        // If token has userId (from vendorUserLogin), merge it into user context

        const vendorUser = await models.VendorUser.findById(
          decoded.vendorUserId,
        ).populate('vendor');

        if (vendorUser) {
          context.insuranceVendorUser = vendorUser;
        }
      } catch (e) {
        // Token verification failed - might be erxes core token, ignore
      }
    }

    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },

  apiHandlers: [
    // preview contract
    {
      path: '/contracts/:id/preview',
      method: 'GET',
      resolver: async (req, res) => {
        const subdomain = getSubdomain(req);
        const models: IModels = await generateModels(subdomain);
        const contractId = req.params.id;
        const contract = await models.Contract.findById(contractId);

        if (!contract) {
          res.status(404).send('Contract not found');
          return;
        }

        const html = await templateManager.generateHTML(
          contract.toObject(),
          models,
        );

        res.send(html);
      },
    },

    // pdf contract
    {
      path: '/contracts/:id/pdf',
      method: 'GET',
      resolver: async (req, res) => {
        const subdomain = getSubdomain(req);
        const models: IModels = await generateModels(subdomain);
        const contractId = req.params.id;
        const contract = await models.Contract.findById(contractId);

        if (!contract) {
          res.status(404).send('Contract not found');
          return;
        }

        const html = await templateManager.generateHTML(
          contract.toObject(),
          models,
        );

        const pdfGenerator = new PdfGenerator();
        const pdfBuffer = await pdfGenerator.generatePDF(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=contract-${contract.contractNumber}.pdf`,
        );

        res.send(pdfBuffer);
      },
    },
  ],
});
