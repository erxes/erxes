import { graphqlRequest } from '../db/connection';
import { emailDeliveryFactory } from '../db/factories';

import './setup.ts';

describe('Email delivery queries', () => {
  test('Transaction email deliveries', async () => {
    await emailDeliveryFactory({
      subject: 'subject',
      kind: 'transaction'
    });

    const query = `
      query transactionEmailDeliveries($searchValue: String, $page: Int, $perPage: Int) {
        transactionEmailDeliveries(searchValue: $searchValue, page: $page, perPage: $perPage) {
          list {
            _id
          }
        }
      }
    `;

    const response = await graphqlRequest(query, 'transactionEmailDeliveries', {
      searchValue: 'subject'
    });

    expect(response.list.length).toBe(1);
  });

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
