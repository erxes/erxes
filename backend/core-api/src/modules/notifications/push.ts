import { USER_ROLES } from 'erxes-api-shared/utils';
import * as admin from 'firebase-admin';
import { IModels } from '~/connectionResolvers';
import { getConfig } from '@/organization/settings/utils/configs';
import { initFirebase } from '~/modules/notifications/utils';

let firebaseCredentials = '';

export type TMobilePushInput = {
  receivers?: string[];
  deviceTokens?: string[];
  title?: string;
  body?: string;
  data?: Record<string, string>;
};

export const sendMobilePush = async (
  models: IModels,
  { receivers, deviceTokens, title, body, data }: TMobilePushInput,
) => {
  const credentials = await getConfig(
    'GOOGLE_APPLICATION_CREDENTIALS_JSON',
    '',
    models,
  );

  // a key saved from settings replaces the running apps without a restart
  if (admin.apps.length && credentials !== firebaseCredentials) {
    await Promise.all(admin.apps.map((app) => app?.delete()));
  }

  if (!admin.apps.length) {
    await initFirebase(models, credentials);
    firebaseCredentials = credentials;
  }

  const additionalConfigs = await models.Configs.findOne({
    code: 'GOOGLE_APP_ADDITIONAL_CREDS_JSON',
  });

  if (admin.apps.length === 1 && additionalConfigs) {
    for (const [index, item] of (additionalConfigs?.value || []).entries()) {
      await initFirebase(models, item, `app${index + 1}`);
    }
  }

  const tokens: string[] = [];

  if (receivers?.length) {
    const xs = await models.Users.find({
      _id: { $in: receivers },
      role: { $ne: USER_ROLES.SYSTEM },
    }).distinct('deviceTokens');

    for (const x of xs) {
      if (x) tokens.push(x);
    }
  }

  if (deviceTokens?.length) {
    tokens.push(...deviceTokens);
  }

  if (tokens.length > 0) {
    for (const app of admin.apps) {
      if (app) {
        const transporter = app.messaging();

        for (const token of tokens) {
          await transporter
            .send({
              token,
              notification: { title, body },
              data: data || {},
            })
            .catch(async (e: Error) => {
              console.error(
                `Error occurred during firebase send: ${e.message}`,
              );

              if (!e.message.includes('SenderId mismatch')) {
                await models.Users.updateOne(
                  { deviceTokens: token },
                  { $pull: { deviceTokens: token } },
                );
              }
            });
        }
      }
    }
  }
};
