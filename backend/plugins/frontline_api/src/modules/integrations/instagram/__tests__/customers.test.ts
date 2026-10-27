import type { IModels } from '~/connectionResolvers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { getOrCreateCustomer } from '../controller/store';
import { getInstagramUser } from '../utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('../utils', () => ({ getInstagramUser: jest.fn() }));
jest.mock('../debuggers', () => ({ debugError: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const save = jest.fn();
const customer: {
  _id: string;
  erxesApiId: string;
  firstName?: string;
  profilePic?: string;
  save: typeof save;
} = { _id: 'provider-customer', erxesApiId: '', save };
const findCustomer = jest.fn();
const createCustomer = jest.fn();
const deleteCustomer = jest.fn();
const integration = {
  erxesApiId: 'inbox-integration',
  facebookPageId: 'fb-page',
  facebookPageTokensMap: { 'fb-page': 'page-token' },
};
const models = {
  InstagramCustomers: {
    findOne: findCustomer,
    create: createCustomer,
    deleteOne: deleteCustomer,
  },
} as unknown as IModels;

const getCustomer = (username?: string) =>
  getOrCreateCustomer(
    models,
    'test',
    integration,
    'ig-sender',
    username,
  );

beforeEach(() => {
  jest.clearAllMocks();
  customer.erxesApiId = '';
  customer.firstName = undefined;
  customer.profilePic = undefined;
  jest.mocked(sendTRPCMessage).mockResolvedValue(undefined);
  findCustomer.mockResolvedValue(null);
  createCustomer.mockImplementation(async (doc: Partial<typeof customer>) =>
    Object.assign(customer, doc),
  );
  jest.mocked(receiveInboxMessage).mockResolvedValue({
    status: 'success',
    data: { _id: 'core-customer' },
  });
  jest.mocked(getInstagramUser).mockResolvedValue({
    username: 'profile_username',
    profile_pic: 'https://example.com/avatar.jpg',
  });
});

test('creates a linked customer with available profile data', async () => {
  await expect(getCustomer()).resolves.toMatchObject({
    erxesApiId: 'core-customer',
  });
  expect(createCustomer).toHaveBeenCalledWith({
    userId: 'ig-sender',
    integrationId: 'inbox-integration',
    firstName: 'profile_username',
    profilePic: 'https://example.com/avatar.jpg',
  });
  expect(save).toHaveBeenCalled();
});

test.each(['denied', 'empty'])(
  'keeps a new sender when the profile is %s',
  async (kind) => {
    if (kind === 'denied') {
      jest
        .mocked(getInstagramUser)
        .mockRejectedValueOnce(new Error('Consent required'));
    } else {
      jest.mocked(getInstagramUser).mockResolvedValueOnce({ name: null });
    }

    await expect(getCustomer()).resolves.toMatchObject({
      erxesApiId: 'core-customer',
    });
    expect(createCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'ig-sender' }),
    );
    expect(receiveInboxMessage).toHaveBeenCalledWith('test', {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        _id: 'instagram-provider-customer',
        integrationId: 'inbox-integration',
        isUser: true,
      }),
    });
  },
);

test('uses the comment author username when Meta cannot return a profile', async () => {
  jest
    .mocked(getInstagramUser)
    .mockRejectedValueOnce(new Error('Consent required'));

  await getCustomer('comment_author');

  expect(createCustomer).toHaveBeenCalledWith(
    expect.objectContaining({ firstName: 'comment_author' }),
  );
});

test('reuses existing customers without looking up or overwriting their profile', async () => {
  findCustomer.mockResolvedValueOnce({
    ...customer,
    erxesApiId: 'existing-core',
  });

  await expect(getCustomer()).resolves.toMatchObject({
    erxesApiId: 'existing-core',
  });
  expect(getInstagramUser).not.toHaveBeenCalled();
  expect(createCustomer).not.toHaveBeenCalled();
  expect(receiveInboxMessage).not.toHaveBeenCalled();
});

test('a real Core failure propagates while retaining the identity for retry', async () => {
  jest.mocked(receiveInboxMessage).mockResolvedValueOnce({
    status: 'error',
    errorMessage: 'Core unavailable',
  });

  await expect(getCustomer()).rejects.toThrow('Core unavailable');
  expect(deleteCustomer).not.toHaveBeenCalled();
});
