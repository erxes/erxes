import * as sinon from 'sinon';
import { accountFactory, integrationFactory } from '../factories';
import * as gmailUtils from '../gmail//util';
import { refreshAccessToken } from '../gmail/auth';
import { ConversationMessages, Conversations, Customers } from '../gmail/models';
import * as receive from '../gmail/receiveEmails';
import * as send from '../gmail/send';
import * as store from '../gmail/store';
import { getCredentialsByEmailAccountId } from '../gmail/util';
import * as watch from '../gmail/watch';
import * as messageBroker from '../messageBroker';
import { Accounts } from '../models';
import './setup.ts';

describe('Gmail test', () => {
  let accountId: string;
  let integrationId: string;
  let erxesApiId: string;

  const credential = {
    access_token: 'jalsjdklasjd',
    refresh_token: 'kdsjd',
    expiry_date: 123,
    scope: 'alksjdaklsdj',
    historyId: 'historyId',
  };

  beforeEach(async () => {
    const account = await accountFactory({
      kind: 'gmail',
      email: 'user@gmail.com',
      uid: 'user@gmail.com',
      token: 'wjqelkq',
      tokenSecret: 'alsdjaklsdjkl',
      expireDate: 'expireDate',
      scope: 'scope',
    });

    const integration = await integrationFactory({
      kind: 'gmail',
      erxesApiId: 'alksdjkl',
    });

    accountId = account._id;
    integrationId = integration._id;
    erxesApiId = integration.erxesApiId;
  });

  afterEach(async () => {
    await Accounts.remove({});
    await Customers.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  test('Create or get customer', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: 'asdlkajsdklj' });
    });

    await store.createOrGetCustomer('test123@mail.com', {
      id: integrationId,
      erxesApiId,
    });

    const customer = await Customers.findOne({ email: 'test123@mail.com' });

    expect(customer.email).toEqual('test123@mail.com');
    expect(customer.integrationId).toEqual(integrationId);
    expect(customer.erxesApiId).toEqual('asdlkajsdklj');

    mock.restore();
  });

  test('Create or get conversation', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: 'dkjskldj' });
    });

    await store.createOrGetConversation({
      email: 'test123@mail.com',
      subject: 'alksdjalk',
      receivedEmail: 'test22@mail.com',
      integrationIds: {
        id: integrationId,
        erxesApiId,
      },
      customerErxesApiId: 'akjsdlkajsd',
    });

    const conversation = await Conversations.findOne({ integrationId });

    expect(conversation.to).toEqual('test22@mail.com');
    expect(conversation.from).toEqual('test123@mail.com');
    expect(conversation.erxesApiId).toEqual('dkjskldj');

    mock.restore();
  });

  test('Create or get message', async () => {
    const mock = sinon.stub(messageBroker, 'sendRPCMessage').callsFake(() => {
      return Promise.resolve({ _id: 'dkjskldj' });
    });

    await store.createOrGetConversationMessage({
      messageId: 'ajklsdja',
      customerErxesApiId: 'kljalkdjalk',
      conversationIds: {
        id: '123',
        erxesApiId: 'erxesApiId',
      },
      message: {
        conversationId: 'alksjdalkdj',
        threadId: 'threadId',
        headerId: 'headerId',
        to: 'foo@mail.com',
        from: 'john@mail.com',
        reply: ['asdasdklj'],
        references: 'references',
      },
    });

    const message = await ConversationMessages.findOne({ conversationId: '123' });

    expect(message.messageId).toEqual('ajklsdja');
    expect(message.headerId).toEqual('headerId');
    expect(message.threadId).toEqual('threadId');
    expect(JSON.stringify(message.to)).toEqual(JSON.stringify([{ email: 'foo@mail.com' }]));

    mock.restore();
  });

  test('Parse message', async () => {
    const doc = {
      id: '166cd0fcf47dd70b',
      threadId: '166bedb4e84d7186',
      labelIds: ['UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL', 'INBOX'],
      snippet:
        '&gt; Begin forwarded message: &gt; &gt; From: John &gt; Subject: Fwd: test &gt; Date: October 31, 2018 at 16:24:12 GMT+8 &gt; To: Contacts &gt; Cc: john &gt; &gt; &gt;',
      historyId: '6380191',
      internalDate: '1541038651000',
      payload: {
        partId: '',
        mimeType: 'multipart/alternative',
        filename: '',
        headers: [
          { name: 'Return-Path', value: '<mungehubolud@gmail.com>' },
          {
            name: 'From',
            value: 'test <test@gmail.com>',
          },
          {
            name: 'Content-Type',
            value: 'multipart/alternative; boundary="Apple-Mail=_56A0F385-0DE5-4558-A392-AABFF75F807C"',
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
          {
            name: 'Message-Id',
            value: '<DFA8BC9E-8561-42A9-9313-AD0F5ED24186@gmail.com>',
          },
        ],
        body: { size: 0 },
        parts: [
          {
            partId: '0',
            mimeType: 'text/plain',
            filename: '',
            headers: [
              { name: 'Content-Transfer-Encoding', value: '7bit' },
              { name: 'Content-Type', value: 'text/plain; charset=us-ascii' },
            ],
            body: {
              size: 519,
              data:
                'DQoNCj4gQmVnaW4gZm9yd2FyZGVkIG1lc3NhZ2U6DQo-IA0KPiBGcm9tOiBNdW5raGJvbGQgRGVtYmVsIDxtdW5nZWh1Ym9sdWRAZ21haWwuY29tPg0KPiBTdWJqZWN0OiBGd2Q6IHRlc3QgdHVyc2hpbHQNCj4gRGF0ZTogT2N0b2JlciAzMSwgMjAxOCBhdCAxNjoyNDoxMiBHTVQrOA0KPiBUbzogQ29udGFjdHMgPG11bmtoYm9sZC5kQG5tdGVjLmNvPg0KPiBDYzogTXVua2hib2xkIERlbWJlbCA8bXVua2hib2xkLmRlQGdtYWlsLmNvbT4NCj4gDQo-IA0KPiANCj4-IEJlZ2luIGZvcndhcmRlZCBtZXNzYWdlOg0KPj4gDQo-PiBGcm9tOiBtdW5raGJvbGQuZEBubXRlYy5jbyA8bWFpbHRvOm11bmtoYm9sZC5kQG5tdGVjLmNvPg0KPj4gU3ViamVjdDogdGVzdCB0dXJzaGlsdA0KPj4gRGF0ZTogT2N0b2JlciAyOSwgMjAxOCBhdCAxNjowNTozNSBHTVQrOA0KPj4gVG86IG11bmtoYm9sZC5kQG5tdGVjLmNvIDxtYWlsdG86bXVua2hib2xkLmRAbm10ZWMuY28-DQo-PiANCj4-IDxwPmhlbGxvdyB3b3JsZDwvcD4NCg0K',
            },
          },
          {
            partId: '1',
            mimeType: 'multipart/related',
            filename: '',
            headers: [
              {
                name: 'Content-Type',
                value:
                  'multipart/related; type="text/html"; boundary="Apple-Mail=_E7B1D8EA-76E9-4FAE-8CEA-F4D8E5F0B687"',
              },
            ],
            body: { size: 0 },
            parts: [
              {
                partId: '1.0',
                mimeType: 'text/html',
                filename: '',
                headers: [
                  { name: 'Content-Transfer-Encoding', value: 'quoted-printable' },
                  { name: 'Content-Type', value: 'text/html; charset=us-ascii' },
                ],
                body: {
                  size: 4829,
                  data:
                    'PGh0bWw-PGhlYWQ-PG1ldGEgaHR0cC1lcXVpdj0iQ29udGVudC1UeXBlIiBjb250ZW50PSJ0ZXh0L2h0bWw7IGNoYXJzZXQ9dXMtYXNjaWkiPjwvaGVhZD48Ym9keSBzdHlsZT0id29yZC13cmFwOiBicmVhay13b3JkOyAtd2Via2l0LW5ic3AtbW9kZTogc3BhY2U7IGxpbmUtYnJlYWs6IGFmdGVyLXdoaXRlLXNwYWNlOyIgY2xhc3M9IiI-PGJyIGNsYXNzPSIiPjxkaXY-PGJyIGNsYXNzPSIiPjxibG9ja3F1b3RlIHR5cGU9ImNpdGUiIGNsYXNzPSIiPjxkaXYgY2xhc3M9IiI-QmVnaW4gZm9yd2FyZGVkIG1lc3NhZ2U6PC9kaXY-PGJyIGNsYXNzPSJBcHBsZS1pbnRlcmNoYW5nZS1uZXdsaW5lIj48ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOiAwcHg7IG1hcmdpbi1yaWdodDogMHB4OyBtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi1sZWZ0OiAwcHg7IiBjbGFzcz0iIj48c3BhbiBzdHlsZT0iZm9udC1mYW1pbHk6IC13ZWJraXQtc3lzdGVtLWZvbnQsIEhlbHZldGljYSBOZXVlLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7IGNvbG9yOnJnYmEoMCwgMCwgMCwgMS4wKTsiIGNsYXNzPSIiPjxiIGNsYXNzPSIiPkZyb206IDwvYj48L3NwYW4-PHNwYW4gc3R5bGU9ImZvbnQtZmFtaWx5OiAtd2Via2l0LXN5c3RlbS1mb250LCBIZWx2ZXRpY2EgTmV1ZSwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmOyIgY2xhc3M9IiI-TXVua2hib2xkIERlbWJlbCAmbHQ7PGEgaHJlZj0ibWFpbHRvOm11bmdlaHVib2x1ZEBnbWFpbC5jb20iIGNsYXNzPSIiPm11bmdlaHVib2x1ZEBnbWFpbC5jb208L2E-Jmd0OzxiciBjbGFzcz0iIj48L3NwYW4-PC9kaXY-PGRpdiBzdHlsZT0ibWFyZ2luLXRvcDogMHB4OyBtYXJnaW4tcmlnaHQ6IDBweDsgbWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tbGVmdDogMHB4OyIgY2xhc3M9IiI-PHNwYW4gc3R5bGU9ImZvbnQtZmFtaWx5OiAtd2Via2l0LXN5c3RlbS1mb250LCBIZWx2ZXRpY2EgTmV1ZSwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmOyBjb2xvcjpyZ2JhKDAsIDAsIDAsIDEuMCk7IiBjbGFzcz0iIj48YiBjbGFzcz0iIj5TdWJqZWN0OiA8L2I-PC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPjxiIGNsYXNzPSIiPkZ3ZDogdGVzdCB0dXJzaGlsdDwvYj48YnIgY2xhc3M9IiI-PC9zcGFuPjwvZGl2PjxkaXYgc3R5bGU9Im1hcmdpbi10b3A6IDBweDsgbWFyZ2luLXJpZ2h0OiAwcHg7IG1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLWxlZnQ6IDBweDsiIGNsYXNzPSIiPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsgY29sb3I6cmdiYSgwLCAwLCAwLCAxLjApOyIgY2xhc3M9IiI-PGIgY2xhc3M9IiI-RGF0ZTogPC9iPjwvc3Bhbj48c3BhbiBzdHlsZT0iZm9udC1mYW1pbHk6IC13ZWJraXQtc3lzdGVtLWZvbnQsIEhlbHZldGljYSBOZXVlLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7IiBjbGFzcz0iIj5PY3RvYmVyIDMxLCAyMDE4IGF0IDE2OjI0OjEyIEdNVCs4PGJyIGNsYXNzPSIiPjwvc3Bhbj48L2Rpdj48ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOiAwcHg7IG1hcmdpbi1yaWdodDogMHB4OyBtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi1sZWZ0OiAwcHg7IiBjbGFzcz0iIj48c3BhbiBzdHlsZT0iZm9udC1mYW1pbHk6IC13ZWJraXQtc3lzdGVtLWZvbnQsIEhlbHZldGljYSBOZXVlLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7IGNvbG9yOnJnYmEoMCwgMCwgMCwgMS4wKTsiIGNsYXNzPSIiPjxiIGNsYXNzPSIiPlRvOiA8L2I-PC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPkNvbnRhY3RzICZsdDs8YSBocmVmPSJtYWlsdG86bXVua2hib2xkLmRAbm10ZWMuY28iIGNsYXNzPSIiPm11bmtoYm9sZC5kQG5tdGVjLmNvPC9hPiZndDs8YnIgY2xhc3M9IiI-PC9zcGFuPjwvZGl2PjxkaXYgc3R5bGU9Im1hcmdpbi10b3A6IDBweDsgbWFyZ2luLXJpZ2h0OiAwcHg7IG1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLWxlZnQ6IDBweDsiIGNsYXNzPSIiPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsgY29sb3I6cmdiYSgwLCAwLCAwLCAxLjApOyIgY2xhc3M9IiI-PGIgY2xhc3M9IiI-Q2M6IDwvYj48L3NwYW4-PHNwYW4gc3R5bGU9ImZvbnQtZmFtaWx5OiAtd2Via2l0LXN5c3RlbS1mb250LCBIZWx2ZXRpY2EgTmV1ZSwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmOyIgY2xhc3M9IiI-TXVua2hib2xkIERlbWJlbCAmbHQ7PGEgaHJlZj0ibWFpbHRvOm11bmtoYm9sZC5kZUBnbWFpbC5jb20iIGNsYXNzPSIiPm11bmtoYm9sZC5kZUBnbWFpbC5jb208L2E-Jmd0OzxiciBjbGFzcz0iIj48L3NwYW4-PC9kaXY-PGJyIGNsYXNzPSIiPjxkaXYgY2xhc3M9IiI-PG1ldGEgaHR0cC1lcXVpdj0iQ29udGVudC1UeXBlIiBjb250ZW50PSJ0ZXh0L2h0bWw7IGNoYXJzZXQ9dXMtYXNjaWkiIGNsYXNzPSIiPjxkaXYgc3R5bGU9IndvcmQtd3JhcDogYnJlYWstd29yZDsgLXdlYmtpdC1uYnNwLW1vZGU6IHNwYWNlOyBsaW5lLWJyZWFrOiBhZnRlci13aGl0ZS1zcGFjZTsiIGNsYXNzPSIiPjxiciBjbGFzcz0iIj4NCjxkaXYgY2xhc3M9IiI-PGJyIGNsYXNzPSIiPjxibG9ja3F1b3RlIHR5cGU9ImNpdGUiIGNsYXNzPSIiPjxkaXYgY2xhc3M9IiI-QmVnaW4gZm9yd2FyZGVkIG1lc3NhZ2U6PC9kaXY-PGJyIGNsYXNzPSJBcHBsZS1pbnRlcmNoYW5nZS1uZXdsaW5lIj48ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOiAwcHg7IG1hcmdpbi1yaWdodDogMHB4OyBtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi1sZWZ0OiAwcHg7IiBjbGFzcz0iIj48c3BhbiBzdHlsZT0iZm9udC1mYW1pbHk6IC13ZWJraXQtc3lzdGVtLWZvbnQsICZxdW90O0hlbHZldGljYSBOZXVlJnF1b3Q7LCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7IiBjbGFzcz0iIj48YiBjbGFzcz0iIj5Gcm9tOiA8L2I-PC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPjxhIGhyZWY9Im1haWx0bzptdW5raGJvbGQuZEBubXRlYy5jbyIgY2xhc3M9IiI-bXVua2hib2xkLmRAbm10ZWMuY288L2E-PGJyIGNsYXNzPSIiPjwvc3Bhbj48L2Rpdj48ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOiAwcHg7IG1hcmdpbi1yaWdodDogMHB4OyBtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi1sZWZ0OiAwcHg7IiBjbGFzcz0iIj48c3BhbiBzdHlsZT0iZm9udC1mYW1pbHk6IC13ZWJraXQtc3lzdGVtLWZvbnQsICZxdW90O0hlbHZldGljYSBOZXVlJnF1b3Q7LCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7IiBjbGFzcz0iIj48YiBjbGFzcz0iIj5TdWJqZWN0OiA8L2I-PC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPjxiIGNsYXNzPSIiPnRlc3QgdHVyc2hpbHQ8L2I-PGJyIGNsYXNzPSIiPjwvc3Bhbj48L2Rpdj48ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOiAwcHg7IG1hcmdpbi1yaWdodDogMHB4OyBtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi1sZWZ0OiAwcHg7IiBjbGFzcz0iIj48c3BhbiBzdHlsZT0iZm9udC1mYW1pbHk6IC13ZWJraXQtc3lzdGVtLWZvbnQsICZxdW90O0hlbHZldGljYSBOZXVlJnF1b3Q7LCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7IiBjbGFzcz0iIj48YiBjbGFzcz0iIj5EYXRlOiA8L2I-PC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPk9jdG9iZXIgMjksIDIwMTggYXQgMTY6MDU6MzUgR01UKzg8YnIgY2xhc3M9IiI-PC9zcGFuPjwvZGl2PjxkaXYgc3R5bGU9Im1hcmdpbi10b3A6IDBweDsgbWFyZ2luLXJpZ2h0OiAwcHg7IG1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLWxlZnQ6IDBweDsiIGNsYXNzPSIiPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPjxiIGNsYXNzPSIiPlRvOiA8L2I-PC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LWZhbWlseTogLXdlYmtpdC1zeXN0ZW0tZm9udCwgSGVsdmV0aWNhIE5ldWUsIEhlbHZldGljYSwgc2Fucy1zZXJpZjsiIGNsYXNzPSIiPjxhIGhyZWY9Im1haWx0bzptdW5raGJvbGQuZEBubXRlYy5jbyIgY2xhc3M9IiI-bXVua2hib2xkLmRAbm10ZWMuY288L2E-PGJyIGNsYXNzPSIiPjwvc3Bhbj48L2Rpdj48YnIgY2xhc3M9IiI-PGRpdiBjbGFzcz0iIj48ZGl2IGNsYXNzPSIiPiZsdDtwJmd0O2hlbGxvdyB3b3JsZCZsdDsvcCZndDs8aW1nIGNsYXNzPSIiIGFwcGxlLWlubGluZT0ieWVzIiBpZD0iMUQ3NEUzRDUtRTA3OC00MUM1LUFBMTktREIyQTJCODI3ODM4IiBzcmM9ImNpZDpDNDg4NjM3QS03NTdGLTQ4ODQtQkNFMC1FRDM5MTRFMEFDODVAbGFuIj48L2Rpdj48L2Rpdj48L2Jsb2NrcXVvdGU-PC9kaXY-PGJyIGNsYXNzPSIiPjwvZGl2PjwvZGl2PjwvYmxvY2txdW90ZT48L2Rpdj48YnIgY2xhc3M9IiI-PC9ib2R5PjwvaHRtbD4=',
                },
              },
              {
                partId: '1.1',
                mimeType: 'image/png',
                filename: 'clear-400x400-logo.png',
                headers: [
                  { name: 'Content-Transfer-Encoding', value: 'base64' },
                  {
                    name: 'Content-Disposition',
                    value: 'inline; filename=clear-400x400-logo.png',
                  },
                  {
                    name: 'Content-Type',
                    value: 'image/png; x-unix-mode=0644; name="clear-400x400-logo.png"',
                  },
                  {
                    name: 'Content-Id',
                    value: '<C488637A-757F-4884-BCE0-ED3914E0AC85@lan>',
                  },
                ],
                body: {
                  attachmentId:
                    'ANGjdJ9D5l-l06ZJE8fm3puWwehb0GXq6E0NzblV35a0jgD-R6NbVkA2Z5HXVrJ4wuTX1HG0PUsKnYQ45tknJb8WYLg-DisvMDht3p6xZC8v2mB1p11_sfLsMcxKt9pl858gTlYB_ObJWpVep3wCduRSD55RnUw7hMn1yrdNT_7826oz6Eo8EieRstmnOZGzGR-xKBf_3uYY7SisBkzQeyuGBs-Kd9ltKiBD4BjUmvJ2GBntFTwJ_7zsQLGKyMSGnv3bkHU3dhWIvUIMxNWCUQe9L1eFStf1DU5RIOQiTVhG6mLFZveSusWqnrazPw3Q3IOjfnnzXjVIlzDYfcHt9xoGjJf4jPpI5UJxx_glRulpv_fNe8EdnN_revSbu8ksKBYsRlrQ0I2a0t-7sau2',
                  size: 112714,
                },
              },
            ],
          },
        ],
      },
      sizeEstimate: 165978,
    };

    const data = gmailUtils.parseMessage(doc);

    expect(data.to).toEqual('Contacts <test@mail.co>');
    expect(data.from).toEqual('test <test@gmail.com>');
    expect(data.cc).toEqual('test1@gmail.com');
    expect(data.bcc).toEqual('test@gmail.com');
    expect(data.subject).toEqual('Fwd: test');
    expect(data.attachments[0].filename).toEqual('clear-400x400-logo.png');
    expect(data.attachments[0].mimeType).toEqual('image/png');
    expect(data.attachments[0].size).toEqual(112714);
    expect(data.attachments[0].attachmentId).toEqual(
      'ANGjdJ9D5l-l06ZJE8fm3puWwehb0GXq6E0NzblV35a0jgD-R6NbVkA2Z5HXVrJ4wuTX1HG0PUsKnYQ45tknJb8WYLg-DisvMDht3p6xZC8v2mB1p11_sfLsMcxKt9pl858gTlYB_ObJWpVep3wCduRSD55RnUw7hMn1yrdNT_7826oz6Eo8EieRstmnOZGzGR-xKBf_3uYY7SisBkzQeyuGBs-Kd9ltKiBD4BjUmvJ2GBntFTwJ_7zsQLGKyMSGnv3bkHU3dhWIvUIMxNWCUQe9L1eFStf1DU5RIOQiTVhG6mLFZveSusWqnrazPw3Q3IOjfnnzXjVIlzDYfcHt9xoGjJf4jPpI5UJxx_glRulpv_fNe8EdnN_revSbu8ksKBYsRlrQ0I2a0t-7sau2',
    );
  });

  test('Get attachment', async () => {
    const buf = Buffer.from('ajsdklajdlaskjda', 'utf8');

    const mock = sinon.stub(receive, 'getAttachment').callsFake(() => {
      return Promise.resolve(buf);
    });

    const response = await receive.getAttachment(credential, 'messageId', 'attachmentId');

    expect(response).toEqual(buf);

    mock.restore();
  });

  test('Send gmail', async () => {
    const doc = {
      conversationId: 'asjdlkasj',
      erxesApiMessageId: 'jkwej',
      messageId: 'lskjdkj',
      threadId: '1111',
      subject: 'subject',
      body: 'body',
      to: [{ email: 'demo1@gmail.com', name: 'demo1' }],
      cc: [{ email: 'demo2@gmail.com', name: 'demo2' }],
      bcc: [{ email: 'demo3@gmail.com', name: 'demo3' }],
      from: [{ email: 'demo4@gmail.com', name: 'demo4' }],
      references: 'references',
      headerId: 'headerId',
    };

    const mock = sinon.stub(send, 'composeEmail').callsFake();
    const spy = sinon.spy(send, 'createMimeMessage');

    await send.sendGmail(accountId, 'user@gmail.com', doc);

    expect(spy.withArgs(doc).calledOnce).toBe(true);

    mock.restore();
    spy.restore();
  });

  test('Get profile', async () => {
    const mock = sinon
      .stub(gmailUtils, 'getProfile')
      .callsFake(() => Promise.resolve({ data: { emailAddress: 'john@gmail.com' } }));

    const response = await gmailUtils.getProfile(credential);

    expect(response.data.emailAddress).toEqual('john@gmail.com');

    mock.restore();
  });

  test('Get credential by accountId', async () => {
    const response = await getCredentialsByEmailAccountId({ accountId });

    const account = await Accounts.findOne({ _id: accountId });

    expect(response.access_token).toEqual(account.token);
    expect(response.refresh_token).toEqual(account.tokenSecret);
  });

  test('Get credential by email', async () => {
    const selector = { email: 'user@gmail.com' };

    const response = await getCredentialsByEmailAccountId({ email: 'user@gmail.com' });

    const account = await Accounts.findOne(selector);

    expect(response.access_token).toEqual(account.token);
    expect(response.refresh_token).toEqual(account.tokenSecret);
  });

  test('Watch push notification for gmail', async () => {
    const mock = sinon
      .stub(watch, 'watchPushNotification')
      .callsFake(() => Promise.resolve({ data: { historyId: 'historyId', expiration: 'akljsdaklsjd' } }));

    const { data } = await watch.watchPushNotification('user@gmail.com');

    expect(data.historyId).toEqual('historyId');
    expect(data.expiration).toEqual('akljsdaklsjd');

    mock.restore();
  });

  test('Refresh access token', async () => {
    await refreshAccessToken(accountId, credential);

    const account = await Accounts.findOne({ _id: accountId });

    expect(account.token).toEqual(credential.access_token);
    expect(account.tokenSecret).toEqual(credential.refresh_token);
    expect(account.expireDate).toEqual(credential.expiry_date.toString());
  });
});
