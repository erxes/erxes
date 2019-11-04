import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import { buildEmail } from '../gmail/util';
import { Accounts, Integrations } from '../models';
import * as api from '../nylas/api';
import { updateAccount } from '../nylas/store';
import * as tracker from '../nylas/tracker';
import { buildEmailAddress } from '../nylas/utils';
import { cleanHtml } from '../utils';
import './setup.ts';

describe('Nylas gmail test', () => {
  let accountId: string;

  const attachmentDoc = {
    name: 'test',
    path: 'path',
    type: 'type',
    accessToken: 'askldjk',
  };

  beforeEach(async () => {
    const doc = { kind: 'gmail', email: 'user@mail.com' };

    const account = await accountFactory({ ...doc, nylasToken: 'askldjaslkjdlak' });
    await integrationFactory({
      ...doc,
      accountId: account._id,
      erxesApiId: 'alkjdlkj',
    });

    accountId = account._id;
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Accounts.remove({});
  });

  test('Send message', async () => {
    const doc = {
      to: [{ email: 'test@mail.com' }],
      cc: [{ email: 'test@mail.com' }],
      bcc: [{ email: 'test@mail.com' }],
      subject: 'subject',
      body: 'body',
      threadId: 'threadId',
      files: [attachmentDoc],
    };

    const mock = sinon.stub(api, 'sendMessage').callsFake(() => '123y7819u39');

    expect(await api.sendMessage('asjdlasjd', doc)).toEqual('123y7819u39');

    mock.restore();
  });

  test('File upload', async () => {
    const mock = sinon.stub(api, 'uploadFile').callsFake(() => Promise.resolve({ id: '812739' }));

    const attachment = (await api.uploadFile(attachmentDoc)) as any;

    expect(attachment.id).toEqual('812739');

    mock.restore();
  });

  test('Get attachment', async () => {
    const mock = sinon.stub(api, 'getAttachment').callsFake(() => Promise.resolve('data'));

    expect(await api.getAttachment('fileId', 'aklsjd')).toEqual('data');

    mock.restore();
  });

  test('Update account', async () => {
    await updateAccount(accountId, 'askljdklwj', 'qwejoiqwej');

    const account = await Accounts.findOne({ _id: accountId });

    expect(account.uid).toEqual('askljdklwj');
    expect(account.nylasToken).toEqual('qwejoiqwej');
  });

  test('Get user email', async () => {
    const mock1 = sinon.stub(api, 'getUserEmailFromGoogle').callsFake(() => Promise.resolve('test1@mail.com'));
    const mock2 = sinon.stub(api, 'getUserEmailFromO365').callsFake(() => Promise.resolve('test2@mail.com'));

    expect(await api.getUserEmailFromGoogle('klasjdlkj')).toEqual('test1@mail.com');
    expect(await api.getUserEmailFromO365('askjsdlkjasjd')).toEqual('test2@mail.com');

    mock1.restore();
    mock2.restore();
  });

  test('Create a webhook', async () => {
    const mock = sinon.stub(tracker, 'createWebhook').callsFake(() => 'j1o2i3as');

    expect(await tracker.createWebhook()).toEqual('j1o2i3as');

    mock.restore();
  });
});

describe('Utils test', () => {
  test('Convert string to email obj', () => {
    const rawString = 'user1@mail.com,user2@mail.com';

    const isUndefined = buildEmailAddress('');
    const emailObj = buildEmailAddress(rawString);

    expect(isUndefined).toBe(undefined);
    expect(emailObj).toEqual([{ email: 'user1@mail.com' }, { email: 'user2@mail.com' }]);
  });

  test('Exctract and build email obj from string', () => {
    const rawString = 'TestUser1 <user1@mail.com>, TestUser2 <user2@mail.com>';

    const emailObj = buildEmail(rawString);
    const isUndefined = buildEmail('');

    expect(isUndefined).toBe(undefined);
    expect(emailObj).toEqual([{ email: 'user1@mail.com' }, { email: 'user2@mail.com' }]);
  });

  test('Clean html and css', () => {
    const html = `
      <!DOCTYPE html>
        <html>
        <body>

        <h1 style="color:red;">My First Heading</h1>

        </body>
      </html>
    `;

    const rawString = cleanHtml(html).trim();

    expect(rawString).toEqual('My First Heading');
  });
});
