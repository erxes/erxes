import { Request, Response } from 'express';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { graphqlPubsub } from './configs';
import { sendCommonMessage } from './messageBroker';
import { Integrations } from './models';
import * as jwt from 'jsonwebtoken';

const { JWT_TOKEN_SECRET = '' } = process.env;

const webhookReceiver = async (req: Request, res: Response): Promise<void> => {
  const subdomain: string = getSubdomain(req);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).send('Unauthorized');
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { integrationId }: any = await jwt.verify(token, JWT_TOKEN_SECRET);

    if (req.body.event === 'incomingCall') {
      const { callId, callerNumber, calledNumber } = req.body;

      const integration = await Integrations.findOne({
        inboxId: integrationId,
        phone: calledNumber
      });

      if (!integration) {
        res.status(401).send('Miss configured integration');
        return;
      }

      let customer = await sendCommonMessage({
        subdomain,
        isRPC: true,
        serviceName: 'contacts',
        action: 'customers.findOne',
        data: {
          primaryPhone: callerNumber
        },
        defaultValue: null
      });

      if (!customer) {
        customer = await sendCommonMessage({
          subdomain,
          isRPC: true,
          serviceName: 'contacts',
          action: 'customers.createCustomer',
          data: {
            primaryPhone: callerNumber
          }
        });
      }

      const payload = {
        customer,
        calledNumber,
        callerNumber,
        integration
      };

      await graphqlPubsub.publish('phoneCallReceived', {
        phoneCallReceived: payload
      });
    }

    res.json({ status: 'success' });
  } catch (e) {
    res.status(401).send('Unauthorized');
    return;
  }
};

export default webhookReceiver;
