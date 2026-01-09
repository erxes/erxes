import { getSubdomain, startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from '~/apollo/resolvers';
import { generateModels, IModels } from '~/connectionResolvers';
import templateManager from './modules/insurance/services/templateManager';
import { PdfGenerator } from './modules/insurance/services/pdfGenerator';

startPlugin({
  name: 'insurance',
  port: 33010,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain);

    context.models = models;

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
