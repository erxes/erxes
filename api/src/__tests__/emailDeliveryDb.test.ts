import { emailDeliveryFactory } from '../db/factories';
import { EmailDeliveries } from '../db/models';

import './setup.ts';

describe('Test email delivery model', () => {
  test('EmailDelivery create email delivery', async () => {
    const doc = {
      attachments: [],
      subject: 'subject',
      body: 'body',
      to: ['test@gmail.com'],
      cc: [''],
      bcc: [''],
      from: 'AuGpury89dguuzMWK',
      kind: 'nylas-gmail',
      userId: 'WQ3tsgnDdDu3jhbQj',
      customerId: 'oqpF46JorrLRkmpKw',
      __v: 0,
    };

    const emailDelivery = await EmailDeliveries.createEmailDelivery(doc);
    expect(emailDelivery).toBeDefined();
    expect(emailDelivery.subject).toEqual(doc.subject);
  });

  test('Transaction email delivery update status', async () => {
    const emailDelivery = await emailDeliveryFactory({
      kind: 'transaction',
      status: 'pending',
    });

    await EmailDeliveries.updateEmailDeliveryStatus(emailDelivery._id, 'received');

    const newEmailDelivery = await EmailDeliveries.findOne({ _id: emailDelivery._id }).lean();

    expect(newEmailDelivery.status).toBe('received');
  });
});
