import * as admin from 'firebase-admin';
import { sendContactsMessage, sendCoreMessage } from './messageBroker';
import { generateModels } from './connectionResolver';
import { debugError } from '@erxes/api-utils/src/debuggers';

const initFirebase = async subdomain => {
  const config = await sendCoreMessage({
    subdomain,
    action: 'configs.findOne',
    data: {
      code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON'
    },
    isRPC: true,
    defaultValue: null
  });

  if (!config) {
    return;
  }
  const codeString = config.value || 'value';

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
};

export const sendCustomerMobileNotification = async ({
  subdomain,
  recieverIds,
  data,
  title,
  body
}) => {
  const models = generateModels(subdomain);

  if (!admin.apps.length) {
    await initFirebase(models);
  }

  const transporter = admin.messaging();
  const tokens: string[] = [];

  const receivers = await sendContactsMessage({
    subdomain,
    action: '',
    data: {
      _id: { $in: recieverIds },
      role: { $ne: 'system' }
    },
    isRPC: true,
    defaultValue: []
  });

  for (const receiver of receivers) {
    if (receiver?.deviceTokens) {
      tokens.push(receiver.deviceTokens);
    }
  }

  const errorTokens: string[] = [];

  if (!!tokens?.length) {
    for (const token of tokens) {
      try {
        await transporter.send({
          token,
          notification: { title, body },
          data: data || {}
        });
      } catch (error) {
        debugError(`Error occurred during firebase send: ${error.message}`);

        errorTokens.push(token);
      }
    }
  }

  if (!!errorTokens?.length) {
    await sendContactsMessage({
      subdomain,
      action: 'customers.updateMany',
      data: {
        selector: { deviceTokens: { $in: errorTokens } },
        modifier: { $pull: { deviceTokens: { $in: errorTokens } } }
      },
      isRPC: true
    });
  }
};
