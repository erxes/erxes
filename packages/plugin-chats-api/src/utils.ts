import * as admin from 'firebase-admin';
import { debugError, debugInfo } from '@erxes/api-utils/src/debuggers';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import { config } from 'process';
import { sendCoreMessage } from './messageBroker';

const initFirebase = async (models): Promise<void> => {
  const config = await models.Configs.findOne({
    code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON',
  });

  if (!config) {
    return;
  }

  const codeString = config.value || 'value';

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      try {
        await admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (e) {
        console.log(`initFireBase error: ${e.message}`);
      }
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
    conversationId,
  }: {
    receivers: string[];
    customerId?: string;
    title: string;
    body: string;
    conversationId?: string;
  },
): Promise<void> => {
  if (!admin.apps.length) {
    await initFirebase(models);
  }

  const tokens: string[] = [];

  if (receivers) {
    tokens.push(
      ...(await models.Users.find({
        _id: { $in: receivers },
        role: { $ne: USER_ROLES.SYSTEM },
      }).distinct('deviceTokens')),
    );
  }

  if (customerId) {
    tokens.push(
      ...(await models.Customers.findOne({ _id: customerId }).distinct(
        'deviceTokens',
      )),
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
          data: { conversationId: conversationId || 'fakeId' },
        })
        .then((response) => {
          debugInfo(`Successfully sent message: ${JSON.stringify(response)}`);
        })
        .catch((error) => {
          debugError(`Error sending message: ${error.message}`);
          throw error;
        });
    }
  }
};

export const getSeenList = async (seenInfos, subdomain) => {

  const seenList: any[] = [];

  for (const info of seenInfos || []) {
    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: info.userId,
      },
      isRPC: true,
    });

    if (user) {
      seenList.push({
        user,
        seenDate: info.seenDate,
        lastSeenMessageId: info.lastSeenMessageId,
      });
    }
  }

  return seenList
}

