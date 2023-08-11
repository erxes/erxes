import { Request, Response } from 'express';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { graphqlPubsub } from './configs';
import { sendCommonMessage } from './messageBroker';

const webhookReceiver = async (req: Request, res: Response): Promise<void> => {
  const subdomain: string = getSubdomain(req);

  if (req.body.event === 'incomingCall') {
    const { callId, callerNumber, calledNumber } = req.body;

    console.log('incomingCall', callId, callerNumber, calledNumber);

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

    graphqlPubsub.publish('phoneCallReceived', {
      phoneCallReceived: {
        _id: callId,
        customer,
        calledNumber
      }
    });
  }

  res.json({ status: 'success' });
};

export default webhookReceiver;
