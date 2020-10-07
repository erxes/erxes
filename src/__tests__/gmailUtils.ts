import * as sinon from 'sinon';
import { accountFactory } from '../factories';
import {
  chunkSubstr,
  createMimeMessage,
  extractEmailFromString,
  getEmailsAsObject,
  getGoogleConfigs,
  gmailRequest,
  parseEmailHeader,
  parseMail,
} from '../gmail/utils';
import { Accounts } from '../models';
import * as utils from '../utils';
import './setup';

describe('Gmail utils', async () => {
  let accountEmail;

  beforeEach(async () => {
    const account = await accountFactory({ email: 'john@mail.com', token: 'token' });

    accountEmail = account.email;
  });

  afterEach(async () => {
    await Accounts.remove({});
  });

  test('Extract email from string', () => {
    // Extract string from to, cc, bcc
    // ex: Name <user@mail.com>
    const test1 = 'John <john@mail.com>';
    const test2 = 'John <john@mail.com> Sarah <sarah@mail.com>';
    const test3 = 'alex@mail.com';
    const test4 = 'alsdjaskljd';

    expect(extractEmailFromString(test1)).toBe('john@mail.com');
    expect(extractEmailFromString(test2)).toBe('john@mail.com sarah@mail.com');
    expect(extractEmailFromString()).toBe('');
    expect(extractEmailFromString('')).toBe('');
    expect(extractEmailFromString(test3)).toBe('alex@mail.com');
    expect(extractEmailFromString(test4)).toBe('');
  });

  test('Get emails as object', () => {
    const test1 = 'John <john@mail.com> Sarah <sarah@mail.com>';
    const test2 = 'john@mail.com sarah@mail.com';

    expect(getEmailsAsObject(test1)).toEqual([{ email: 'john@mail.com' }, { email: 'sarah@mail.com' }]);

    expect(getEmailsAsObject(test2)).toEqual([{ email: 'john@mail.com' }, { email: 'sarah@mail.com' }]);

    expect(getEmailsAsObject('')).toBeUndefined();
  });

  test('Parse rfc822 email header', () => {
    const test1 = 'John <john@mail.com';

    expect(parseEmailHeader(test1)).toEqual({
      name: 'John',
      email: 'john@mail.com',
    });
  });

  test('Chunk string', () => {
    expect(chunkSubstr('KLASJDKLQWJKLASJDLKASJDKLASJDKLASJD', 5)).toEqual([
      'KLASJ',
      'DKLQW',
      'JKLAS',
      'JDLKA',
      'SJDKL',
      'ASJDK',
      'LASJD',
    ]);
  });

  test('Get google configs', async () => {
    const googleMock = sinon.stub(utils, 'getCommonGoogleConfigs').callsFake(() => {
      return Promise.resolve({
        GOOGLE_PROJECT_ID: 'GOOGLE_PROJECT_ID',
        GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
        GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
        GOOGLE_GMAIL_TOPIC: 'GOOGLE_GMAIL_TOPIC',
      });
    });

    const getConfigMock = sinon.stub(utils, 'getConfig').callsFake(() => {
      return Promise.resolve('GOOGLE_GMAIL_TOPIC');
    });

    expect(await getGoogleConfigs()).toEqual({
      GOOGLE_PROJECT_ID: 'GOOGLE_PROJECT_ID',
      GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
      GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
      GOOGLE_GMAIL_TOPIC: 'GOOGLE_GMAIL_TOPIC',
    });

    googleMock.restore();
    getConfigMock.restore();
  });

  test('Send gmail request', async () => {
    const sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).throws(new Error('Failed to send gmail request'));
    sendRequestMock.onCall(1).returns('success');

    // Failed to send gmail request
    const doc = {
      url: 'url',
      type: 'type',
      method: 'GET',
      email: accountEmail,
    };

    try {
      await gmailRequest(doc);
    } catch (e) {
      expect(e.message).toBe('Failed to send gmail request');
    }

    // Successfully send gmail requwest
    const response = await gmailRequest(doc);

    expect(response).toBe('success');

    sendRequestMock.restore();
  });

  test('Parse message', () => {
    const doc = [
      {
        id: '166cd0fcf47dd70b',
        threadId: '166bedb4e84d7186',
        labelIds: ['UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL', 'INBOX'],
        internalDate: '1541038651000',
        payload: {
          partId: '',
          mimeType: 'multipart/mixed',
          filename: '',
          headers: [
            { name: 'Return-Path', value: '<mungehubolud@gmail.com>' },
            {
              name: 'From',
              value: 'test <test@gmail.com>',
            },
            {
              name: 'Content-Type',
              value: 'multipart/; boundary="Apple-Mail=_56A0F385-0DE5-4558-A392-AABFF75F807C"',
            },
            { name: 'Subject', value: 'Fwd: test' },
            { name: 'Date', value: 'Thu, 1 Nov 2018 10:20:40 +0800' },
            {
              name: 'References',
              value: '<BF3F66AF-86DB-497B-B998-4690082E0620@gmail.com>',
            },
            { name: 'To', value: 'Contacts <test@mail.co>' },
            { name: 'Cc', value: 'test1@gmail.com' },
            { name: 'Bcc', value: 'test@gmail.com' },
            { name: 'In-Reply-To', value: 'alskdjalksjdalksjdlaksjd' },
            { name: 'Reply-To', value: 'alksjd' },
            {
              name: 'Message-Id',
              value: '<DFA8BC9E-8561-42A9-9313-AD0F5ED24186@gmail.com>',
            },
          ],
          parts: [
            {
              body: { size: 29, data: 'PGRpdiBkaXI9Imx0ciI-cXdlcXdlPC9kaXY-DQo=' },
              filename: '',
              headers: [
                {
                  name: 'Content-Type',
                  value: "text/html; charset='UTF-8'",
                },
              ],
              name: 'Content-Type',
              value: "text/html; charset='UTF-8'",
              mimeType: 'text/html',
              partId: '0.1',
            },
            {
              body: {
                attachmentId: 'attachmentId',
                size: 34324,
              },
              filename: 'avatar.png',
              headers: [
                {
                  name: 'Content-Type',
                  value: "image/jpeg; name='avatar.png'",
                },
                {
                  name: 'Content-Disposition',
                  value: "attachment; filename='avatar.png'",
                },
              ],
              mimeType: 'image/jpeg',
              partId: '1',
            },
          ],
        },
      },
    ];

    const response = [
      {
        messageId: '166cd0fcf47dd70b',
        labelIds: ['UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL', 'INBOX'],
        threadId: '166bedb4e84d7186',
        subject: 'Fwd: test',
        from: 'test <test@gmail.com>',
        sender: 'test',
        inReplyTo: 'alskdjalksjdalksjdlaksjd',
        replyTo: 'alksjd',
        fromEmail: 'test@gmail.com',
        to: 'test@mail.co',
        cc: 'test1@gmail.com',
        bcc: 'test@gmail.com',
        references: undefined,
        headerId: '<DFA8BC9E-8561-42A9-9313-AD0F5ED24186@gmail.com>',
        attachments: [
          {
            attachmentId: 'attachmentId',
            filename: 'avatar.png',
            mimeType: 'image/jpeg',
            size: 34324,
            headers: {
              'content-disposition': "attachment; filename='avatar.png'",
              'content-type': "image/jpeg; name='avatar.png'",
            },
          },
        ],
      },
    ];

    const parsedMessage = parseMail(doc);

    const [messageObj] = parsedMessage;

    delete messageObj.html;

    expect([messageObj]).toEqual(response);
  });

  test('Create mime message', () => {
    const extendedParams = {
      conversationId: 'conversationId',
      erxesApiMessageId: 'erxesApiMessageId',
      messageId: 'messageId',
      threadId: 'threadId',
    };

    const doc: any = {
      ...extendedParams,
      body: 'body',
      headerId: 'headerId',
      cc: [{ name: 'cc', email: 'cc@mail.com' }],
      to: [{ name: 'to', email: 'to@mail.com' }],
      from: [{ name: 'from', email: 'from@mail.com' }],
      bcc: [{ name: 'bcc', email: 'bcc@mail.com' }],
      references: ['references'],
      inReplyTo: 'inReplyTo',
      subject: 'subject',
      attachments: [
        {
          mimeType: 'mimeType',
          size: 0,
          filename: 'filename',
          data: 'data',
        },
      ],
    };

    expect(createMimeMessage(doc).replace(/\s+/g, ` `)).toBe(
      `MIME-Version: 1.0
      To: [object Object]
      From: <[object Object]>
      Subject: subject
      References:references
      In-Reply-To: inReplyTo
      In-Reply-To: headerId
      Message-ID: headerId
      Cc: [object Object]
      Bcc: [object Object]
      Content-Type: multipart/mixed; boundary=__erxes__
      --__erxes__
      Content-Type: text/html; charset=UTF-8
      Content-Transfer-Encoding: 8bit
      body
      --__erxes__
      Content-Type: mimeType
      Content-Length: 0
      Content-Disposition: attachment; filename="filename"
      Content-Transfer-Encoding: base64
      data
      --__erxes__--`.replace(/\s+/g, ` `),
    );
  });
});
