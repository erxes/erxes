import { graphqlRequest } from '../db/connection';
import { emailDeliveryFactory } from '../db/factories';

import './setup.ts';

describe('Email delivery queries', () => {
  test('Email delivery detail', async () => {
    const emailDelivery = await emailDeliveryFactory({});

    const args = { _id: emailDelivery._id };

    const qry = `
     query emailDeliveryDetail($_id: String! ) {
       emailDeliveryDetail(_id: $_id ) {
        _id
        subject
        body
        to
        cc
        bcc
        attachments
        from
        kind
        userId
        customerId
        createdAt
    
        fromUser {
          _id
          details {
            avatar
            fullName
            position
          }
        }
        fromEmail
      }
    }
    `;

    const response = await graphqlRequest(qry, 'emailDeliveryDetail', args);

    expect(response._id).toBe(emailDelivery._id);
  });
});
