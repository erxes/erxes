import { generateModels } from '../connectionResolver';
import { sendCoreMessage } from '../messageBroker';

export const removeOldNotifications = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const config = await sendCoreMessage({
    subdomain,
    action: 'configs.findOne',
    data: {
      query: {
        code: 'NOTIFICATION_DATA_RETENTION'
      }
    },
    isRPC: true
  });

  const value = config ? config.value : 3;

  const now = new Date();

  const month = now.getMonth();
  const year = now.getFullYear();
  const date = now.getDate();

  await models.Notifications.deleteMany({
    date: { $lte: new Date(year, month - value, date) }
  });
};


