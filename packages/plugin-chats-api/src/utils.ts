import * as admin from 'firebase-admin';
import { debugExternalApi } from 'erxes-api-utils/lib/debuggers';
import { USER_ROLES } from '@erxes/api-utils/src/constants';

const initFirebase = async (models): Promise<void> => {
  const config = await models.Configs.findOne({
    code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON'
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

/**
 * Send notification to mobile device from inbox conversations
 * @param {string} - title
 * @param {string} - body
 * @param {string} - customerId
 * @param {array} - receivers
 */
export const sendMobileNotification = async (
  models,
  {
    receivers,
    title,
    body,
    customerId,
    conversationId
  }: {
    receivers: string[];
    customerId?: string;
    title: string;
    body: string;
    conversationId?: string;
  }
): Promise<void> => {
  if (!admin.apps.length) {
    await initFirebase(models);
  }

  const tokens: string[] = [];

  if (receivers) {
    tokens.push(
      ...(await models.Users.find({
        _id: { $in: receivers },
        role: { $ne: USER_ROLES.SYSTEM }
      }).distinct('deviceTokens'))
    );
  }

  if (customerId) {
    tokens.push(
      ...(await models.Customers.findOne({ _id: customerId }).distinct(
        'deviceTokens'
      ))
    );
  }

  if (tokens.length > 0) {
    // send notification
    for (const token of tokens) {
      admin
        .messaging()
        .send({
          token,
          notification: { title, body },
          data: { conversationId: conversationId || 'fakeId' }
        })
        .then(response => {
          debugExternalApi(
            `Successfully sent message: ${JSON.stringify(response)}`
          );
        })
        .catch(error => {
          debugExternalApi(`Error sending message: ${error.message}`);
          throw error;
        });
    }
  }
};
