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
});
