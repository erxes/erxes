import * as Smooch from 'smooch-core';
import { debugRequest, debugResponse, debugSmooch } from '../debuggers';
import { Integrations } from '../models';
import { getSmoochConfig } from './api';
import receiveMessage from './receiveMessage';
import { SMOOCH_MODELS } from './store';

export interface ISmoochProps {
  kind: string;
  erxesApiId: string;
  telegramBotToken?: string;
  viberBotToken?: string;
  smoochDisplayName?: string;
  lineChannelId?: string;
  lineChannelSecret?: string;
  twilioSid?: string;
  twilioAuthToken?: string;
  twilioPhoneSid?: string;
}

interface IMessage {
  text: string;
  role: string;
  type: string;
  mediaUrl?: string;
}

let smooch: Smooch;

const init = async app => {
  app.post('/smooch/webhook', async (req, res, next) => {
    debugSmooch('Received new message in smooch...');

    try {
      await receiveMessage(req.body);
    } catch (e) {
      return next(e);
    }

    return res.status(200).send('success');
  });

  app.post('/smooch/create-integration', async (req, res, next) => {
    debugRequest(debugSmooch, req);

    const { SMOOCH_APP_ID } = await getSmoochConfig();

    let { kind } = req.body;

    if (kind.includes('smooch')) {
      kind = kind.split('-')[1];
    }

    const { data, integrationId } = req.body;
    const props = JSON.parse(data);

    props.type = kind;

    const smoochProps = <ISmoochProps>{
      kind,
      erxesApiId: integrationId,
    };

    if (kind === 'telegram') {
      smoochProps.telegramBotToken = props.token;
    } else if (kind === 'viber') {
      smoochProps.viberBotToken = props.token;
    } else if (kind === 'line') {
      smoochProps.lineChannelId = props.channelId;
      smoochProps.lineChannelSecret = props.channelSecret;
    } else if (kind === 'twilio') {
      smoochProps.twilioSid = props.accountSid;
      smoochProps.twilioAuthToken = props.authToken;
      smoochProps.twilioPhoneSid = props.phoneNumberSid;
    }

    smoochProps.smoochDisplayName = props.displayName;

    const integration = await Integrations.create(smoochProps);

    try {
      const result = await smooch.integrations.create({ appId: SMOOCH_APP_ID, props });

      await Integrations.updateOne({ _id: integration.id }, { $set: { smoochIntegrationId: result.integration._id } });
    } catch (e) {
      debugSmooch(`Failed to create smooch integration: ${e.message}`);
      next(new Error(e.message));
      await Integrations.deleteOne({ _id: integration.id });
    }

    return res.json({ status: 'ok' });
  });

  app.post('/smooch/reply', async (req, res, next) => {
    const { attachments, conversationId, content, integrationId } = req.body;

    const { SMOOCH_APP_ID } = await getSmoochConfig();

    if (attachments.length > 1) {
      throw new Error('You can only attach one file');
    }

    const integration = await Integrations.findOne({ erxesApiId: integrationId });

    const conversationModel = SMOOCH_MODELS[integration.kind].conversations;

    const customerModel = SMOOCH_MODELS[integration.kind].customers;

    const conversation = await conversationModel.findOne({ erxesApiId: conversationId });

    const customerId = conversation.customerId;

    const user = await customerModel.findOne({ erxesApiId: customerId });

    try {
      const messageInput: IMessage = { text: content, role: 'appMaker', type: 'text' };

      if (attachments.length !== 0) {
        messageInput.type = 'file';
        messageInput.mediaUrl = attachments[0].url;
      }

      const { message } = await smooch.appUsers.sendMessage({
        appId: SMOOCH_APP_ID,
        userId: user.smoochUserId,
        message: messageInput,
      });

      const messageModel = SMOOCH_MODELS[integration.kind].conversationMessages;

      await messageModel.create({
        conversationId: conversation.id,
        messageId: message._id,
        content,
      });
    } catch (e) {
      debugSmooch(`Failed to send smooch message: ${e.message}`);
      next(new Error(e.message));
    }

    debugResponse(debugSmooch, req);

    res.sendStatus(200);
  });
};

export const setupSmooch = async () => {
  const { SMOOCH_APP_KEY_ID, SMOOCH_SMOOCH_APP_KEY_SECRET } = await getSmoochConfig();

  if (!SMOOCH_APP_KEY_ID || !SMOOCH_SMOOCH_APP_KEY_SECRET) {
    debugSmooch(`
      Missing following config
      SMOOCH_APP_KEY_ID: ${SMOOCH_APP_KEY_ID}
      SMOOCH_SMOOCH_APP_KEY_SECRET: ${SMOOCH_SMOOCH_APP_KEY_SECRET}
    `);
    return;
  }

  smooch = new Smooch({
    keyId: SMOOCH_APP_KEY_ID,
    secret: SMOOCH_SMOOCH_APP_KEY_SECRET,
    scope: 'app',
  });
};

export default init;
