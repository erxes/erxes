import { EmailDeliveries } from '../db/models';

import { customerFactory, userFactory } from '../db/factories';
import { IEmailDeliveries } from '../db/models/definitions/emailDeliveries';
import './setup.ts';

describe('Email template db', () => {
  test('Create email template', async () => {
    const customer = await customerFactory();
    const user = await userFactory();

    const doc: IEmailDeliveries = {
      cocType: 'customer',
      cocId: customer._id,
      subject: 'Hi',
      body: 'body',
      toEmails: 'example@yahoo.com',
      userId: user._id,
    };

    const response = await EmailDeliveries.createEmailDelivery(doc);

    expect(response).toBeDefined();
    expect(response._id).toBeDefined();
    expect(response.cocId).toBe(doc.cocId);
    expect(response.cocType).toBe(doc.cocType);
    expect(response.subject).toBe(doc.subject);
    expect(response.body).toBe(doc.body);
    expect(response.toEmails).toBe(doc.toEmails);
    expect(response.userId).toBe(doc.userId);
  });
});
