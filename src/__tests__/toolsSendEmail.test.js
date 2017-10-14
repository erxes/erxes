/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { sendEmail } from '../data/utils';
import mailer from 'nodemailer/lib/mailer';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('data/tools/sendEmail', () => {
  beforeEach(() => {});

  afterEach(() => {});

  test('check whether email is being sent successfully', async () => {
    const doc = {
      test: 'Nofiticaton test',
      content: 'Notification content',
      date: new Date(),
      link: 'https://www.google.com',
    };

    mailer.sendMail = jest.fn();

    await sendEmail({
      toEmails: ['javkhlan.sh@gmail.com'],
      fromEmail: 'test@erxes.io',
      title: 'Notification',
      template: {
        name: 'notification',
        data: {
          notification: doc,
        },
      },
    });

    expect(mailer.sendMail).toBeCalledWith(doc);
  });
});

jest.fn(() => ({ _id: 'fdfdf' }));
