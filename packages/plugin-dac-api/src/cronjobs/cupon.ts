import { generateModels } from '../connectionResolver';

export const deactiveCupon = async (subdomain: string) => {
  console.log('cron running...');

  const models = await generateModels(subdomain);
  await models.DacCupons.updateExpiryCupons();

  console.log('cron runned');
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await deactiveCupon(subdomain);
  }
};
