import * as sinon from 'sinon';
import { CONVERSATION_STATUSES } from '../../data/constants';
import {
  accountFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
  userFactory,
} from '../../db/factories';
import { Accounts, ConversationMessages, Conversations, Integrations } from '../../db/models';
import {
  createMessage,
  getAttachment,
  getGmailUpdates,
  getOrCreateCustomer,
  parseMessage,
  refreshAccessToken,
  sendGmail,
  syncConversation,
} from '../../trackers/gmail';
import { utils } from '../../trackers/gmailTracker';

describe('gmail integration tests', () => {
  afterEach(async () => {
    // clear
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
  });

  test('Get or create conversation', async () => {
    const integration = await integrationFactory({
      kind: 'gmail',
      gmailData: {
        email: 'test@gmail.com',
      },
    });

    let gmailData = {
      from: 'test@gmail.com',
      subject: 'subject',
      headerId: '<A22C0A25-9807-4FEE-B57B-90AF7299E615@gmail.com>',
      messageId: 'messageId',
      reply: '',
    };

    // must be created new conversation, new message
    expect(await Conversations.find({}).countDocuments()).toBe(0);
    expect(await ConversationMessages.find({}).countDocuments()).toBe(0);

    await syncConversation(integration._id, gmailData);

    let conversation = await Conversations.findOne({});

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(await ConversationMessages.find({}).countDocuments()).toBe(1);

    gmailData = {
      from: 'test@gmail.com',
      subject: 'updated subject',
      messageId: 'secondMessageId',
      reply: '<A22C0A25-9807-4FEE-B57B-90AF7299E615@gmail.com>',
      headerId: '<EDFED911-13F1-4F6E-A34F-2968435C78C0@gmail.com>',
    };

    await syncConversation(integration._id, gmailData);

    conversation = await Conversations.findOne({});

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    expect(conversation.status).toBe(CONVERSATION_STATUSES.OPEN);
    expect(conversation.content).toBe(gmailData.subject);
    expect(await Conversations.find({}).countDocuments()).toBe(1);
    expect(await ConversationMessages.find({}).countDocuments()).toBe(2);
  });

  test('Create message', async () => {
    const integration = await integrationFactory({
      kind: 'gmail',
      gmailData: {
        email: 'test@gmail.com',
      },
    });

    const customer = await customerFactory({
      integrationId: integration._id,
    });
    const conversation = await conversationFactory();

    const gmailData = {
      from: 'test@gmail.com',
      subject: 'updated subject',
      messageId: 'firstMessageId',
    };

    await createMessage({ conversation, content: 'content', customer, gmailData });

    const message = await ConversationMessages.findOne({ gmailData: { $exists: true } });
    if (!message || !message.gmailData) {
      throw new Error('Conversation message not found');
    }

    expect(message.gmailData.from).toEqual(gmailData.from);
    expect(message.gmailData.subject).toEqual(gmailData.subject);
  });

  test('Get or create customer', async () => {
    const email = 'test@gmail.com';
    const integration = await integrationFactory({
      kind: 'gmail',
      gmailData: {
        email,
      },
    });

    const customer = await getOrCreateCustomer(integration._id, email);

    if (!customer) {
      throw new Error('Customer not found');
    }
    expect(customer.emails).toContain(email);
  });

  test('Parse message', async () => {
    // gmail.users.messages.get api response
    const receivedEmail = {
      id: '166cd0fcf47dd70b',
      threadId: '166bedb4e84d7186',
      labelIds: ['UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL', 'INBOX'],
      snippet:
        '&gt; Begin forwarded message: &gt; &gt; From: Munkhbold Dembel &gt; Subject: Fwd: test turshilt &gt; Date: October 31, 2018 at 16:24:12 GMT+8 &gt; To: Contacts &gt; Cc: Munkhbold Dembel &gt; &gt; &gt;',
      historyId: '6380191',
      internalDate: '1541038651000',
      payload: {
        partId: '',
        mimeType: 'multipart/alternative',
        filename: '',
        headers: [
          { name: 'Delivered-To', value: 'munkhbold.d@nmtec.co' },
          { name: 'Return-Path', value: '<mungehubolud@gmail.com>' },
          {
            name: 'From',
            value: 'Munkhbold Dembel <mungehubolud@gmail.com>',
          },
          {
            name: 'Content-Type',
            value: 'multipart/alternative; boundary="Apple-Mail=_56A0F385-0DE5-4558-A392-AABFF75F807C"',
          },
          { name: 'Subject', value: 'Fwd: test turshilt' },
          { name: 'Date', value: 'Thu, 1 Nov 2018 10:20:40 +0800' },
          {
            name: 'References',
            value: '<BF3F66AF-86DB-497B-B998-4690082E0620@gmail.com>',
          },
          { name: 'To', value: 'Contacts <munkhbold.d@nmtec.co>' },
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

    const gmailData = parseMessage(receivedEmail);
    if (!gmailData) {
      throw new Error('GmailData not found');
    }
    expect(gmailData.to).toEqual('Contacts <munkhbold.d@nmtec.co>');
    expect(gmailData.from).toEqual('Munkhbold Dembel <mungehubolud@gmail.com>');
    expect(gmailData.cc).toEqual('test1@gmail.com');
    expect(gmailData.bcc).toEqual('test@gmail.com');
    expect(gmailData.subject).toEqual('Fwd: test turshilt');
    expect(gmailData.textPlain).toEqual(
      '\r\n\r\n> Begin forwarded message:\r\n> \r\n> From: Munkhbold Dembel <mungehubolud@gmail.com>\r\n> Subject: Fwd: test turshilt\r\n> Date: October 31, 2018 at 16:24:12 GMT+8\r\n> To: Contacts <munkhbold.d@nmtec.co>\r\n> Cc: Munkhbold Dembel <munkhbold.de@gmail.com>\r\n> \r\n> \r\n> \r\n>> Begin forwarded message:\r\n>> \r\n>> From: munkhbold.d@nmtec.co <mailto:munkhbold.d@nmtec.co>\r\n>> Subject: test turshilt\r\n>> Date: October 29, 2018 at 16:05:35 GMT+8\r\n>> To: munkhbold.d@nmtec.co <mailto:munkhbold.d@nmtec.co>\r\n>> \r\n>> <p>hellow world</p>\r\n\r\n',
    );
    expect(gmailData.textHtml).toEqual(
      '<html><head><meta http-equiv="Content-Type" content="text/html; charset=us-ascii"></head><body style="word-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;" class=""><br class=""><div><br class=""><blockquote type="cite" class=""><div class="">Begin forwarded message:</div><br class="Apple-interchange-newline"><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=""><b class="">From: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class="">Munkhbold Dembel &lt;<a href="mailto:mungehubolud@gmail.com" class="">mungehubolud@gmail.com</a>&gt;<br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=""><b class="">Subject: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class=""><b class="">Fwd: test turshilt</b><br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=""><b class="">Date: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class="">October 31, 2018 at 16:24:12 GMT+8<br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=""><b class="">To: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class="">Contacts &lt;<a href="mailto:munkhbold.d@nmtec.co" class="">munkhbold.d@nmtec.co</a>&gt;<br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=""><b class="">Cc: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class="">Munkhbold Dembel &lt;<a href="mailto:munkhbold.de@gmail.com" class="">munkhbold.de@gmail.com</a>&gt;<br class=""></span></div><br class=""><div class=""><meta http-equiv="Content-Type" content="text/html; charset=us-ascii" class=""><div style="word-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;" class=""><br class="">\r\n<div class=""><br class=""><blockquote type="cite" class=""><div class="">Begin forwarded message:</div><br class="Apple-interchange-newline"><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;" class=""><b class="">From: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class=""><a href="mailto:munkhbold.d@nmtec.co" class="">munkhbold.d@nmtec.co</a><br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;" class=""><b class="">Subject: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class=""><b class="">test turshilt</b><br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;" class=""><b class="">Date: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class="">October 29, 2018 at 16:05:35 GMT+8<br class=""></span></div><div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" class=""><span style="font-family: -webkit-system-font, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;" class=""><b class="">To: </b></span><span style="font-family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class=""><a href="mailto:munkhbold.d@nmtec.co" class="">munkhbold.d@nmtec.co</a><br class=""></span></div><br class=""><div class=""><div class="">&lt;p&gt;hellow world&lt;/p&gt;<img class="" apple-inline="yes" id="1D74E3D5-E078-41C5-AA19-DB2A2B827838" src="cid:C488637A-757F-4884-BCE0-ED3914E0AC85@lan"></div></div></blockquote></div><br class=""></div></div></blockquote></div><br class=""></body></html>',
    );

    if (!gmailData.attachments) {
      throw new Error('Attachment not found');
    }

    expect(gmailData.attachments[0].filename).toEqual('clear-400x400-logo.png');
    expect(gmailData.attachments[0].mimeType).toEqual('image/png');
    expect(gmailData.attachments[0].size).toEqual(112714);
    expect(gmailData.attachments[0].attachmentId).toEqual(
      'ANGjdJ9D5l-l06ZJE8fm3puWwehb0GXq6E0NzblV35a0jgD-R6NbVkA2Z5HXVrJ4wuTX1HG0PUsKnYQ45tknJb8WYLg-DisvMDht3p6xZC8v2mB1p11_sfLsMcxKt9pl858gTlYB_ObJWpVep3wCduRSD55RnUw7hMn1yrdNT_7826oz6Eo8EieRstmnOZGzGR-xKBf_3uYY7SisBkzQeyuGBs-Kd9ltKiBD4BjUmvJ2GBntFTwJ_7zsQLGKyMSGnv3bkHU3dhWIvUIMxNWCUQe9L1eFStf1DU5RIOQiTVhG6mLFZveSusWqnrazPw3Q3IOjfnnzXjVIlzDYfcHt9xoGjJf4jPpI5UJxx_glRulpv_fNe8EdnN_revSbu8ksKBYsRlrQ0I2a0t-7sau2',
    );
  });

  test('Get gmail updates', async () => {
    const email = 'test@gmail.com';
    const historyId = 'historyId';

    await accountFactory({
      uid: email,
      name: email,
      kind: 'gmail',
      token: 'token',
    });

    try {
      await getGmailUpdates({ emailAddress: email, historyId });
    } catch (e) {
      expect(e.message).toBe(`Integration not found gmailData with ${email}`);
    }

    const integration = await integrationFactory({ gmailData: { email, historyId } });

    if (!integration || !integration.gmailData) {
      throw new Error('Integration not found');
    }

    const mock = sinon.stub(utils, 'getMessagesByHistoryId').callsFake();
    await getGmailUpdates({ emailAddress: email, historyId });

    expect(integration.gmailData.historyId).toBe(historyId);
    mock.restore(); // unwraps the spy
  });

  test('send gmail', async () => {
    const mailParams = {
      integrationId: 'integrationId',
      subject: 'subject',
      body: 'body',
      toEmails: 'test@gmail.com',
      cc: 'test1@gmail.com',
      bcc: 'test2@gmail.com',
      attachments: [
        {
          filename: 'ankari-floruss-fall-DSC08890-1600_grande.jpg',
          mimeType: 'image/jpeg',
          size: 21354,
          data: '123',
        },
      ],
      cocType: 'customer',
      cocId: 'customerId',
    };

    const user = await userFactory({});

    try {
      await sendGmail(mailParams, user);
    } catch (e) {
      expect(e.message).toBe(`Integration not found id with ${mailParams.integrationId}`);
    }

    const integration = await integrationFactory({
      gmailData: {
        email: 'test@gmail.com',
      },
    });
    await accountFactory({
      uid: 'test@gmail.com',
      name: 'test@gmail.com',
      kind: 'gmail',
      token: 'token',
    });

    mailParams.integrationId = integration._id;
    const mock = sinon.stub(utils, 'sendEmail').callsFake();

    await sendGmail(mailParams, user);

    mock.restore(); // unwraps the spy
  });

  test('Get attachment', async () => {
    const conversationMessageId = 'conversationMessageId';
    const attachmentId = 'attachmentId';

    try {
      await getAttachment(conversationMessageId, attachmentId);
    } catch (e) {
      expect(e.message).toBe(`Conversation message not found id with ${conversationMessageId}`);
    }

    const account = await accountFactory({
      uid: 'admin@erxes.io',
      kind: 'gmail',
    });

    const integration = await integrationFactory({
      gmailData: {
        email: 'admin@erxes.io',
        accountId: account._id,
      },
    });
    const conversation = await conversationFactory({
      integrationId: integration._id,
    });
    const message = await conversationMessageFactory({
      conversationId: conversation._id,
      gmailData: {
        messageId: 'messageId',
        attachments: [],
        labelIds: [],
      },
    });

    const getGmailAttachment = jest.spyOn(utils, 'getGmailAttachment').mockImplementation(() => ({}));

    await getAttachment(message._id, attachmentId);

    expect(getGmailAttachment.mock.calls.length).toBe(1);
  });

  test('Refresh access token', async () => {
    const integration = await integrationFactory({
      gmailData: {
        email: 'admin@erxes.io',
        accountId: 'accountId',
      },
    });

    const integrationId = 'integrationId';
    const tokens = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      expiry_date: 'expiry_date',
    };

    try {
      await refreshAccessToken(integrationId, tokens);
    } catch (e) {
      expect(e.message).toBe(`Integration not found id with ${integrationId}`);
    }

    if (!integration || !integration.gmailData) {
      throw new Error('Integration not found');
    }

    try {
      await refreshAccessToken(integration.id, tokens);
    } catch (e) {
      expect(e.message).toBe(`Account not found id with ${integration.gmailData.accountId}`);
    }

    const account = await accountFactory({ kind: 'gmail' });
    const _integration = await integrationFactory({
      gmailData: {
        email: 'admin@erxes.io',
        accountId: account._id,
      },
    });

    await refreshAccessToken(_integration.id, tokens);
    const _account = await Accounts.findOne({ _id: account._id });
    if (!_account) {
      throw new Error('Account not found');
    }
    expect(_account.token).toBe(tokens.access_token);
    expect(_account.tokenSecret).toBe(tokens.refresh_token);
    expect(_account.expireDate).toBe(tokens.expiry_date);
  });
});
