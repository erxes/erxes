import { buildSchema, graphql, GraphQLFieldResolver } from 'graphql';
import type { IContext } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';
import { selectFields } from '~/__tests__/helpers/graphql';
import { mutations } from '../../../schemas/covers';
import { coverMutations } from '../covers';

jest.mock('~/initWorker', () => ({ sendPosclientMessage: jest.fn() }));

const sendMessage = jest.mocked(sendPosclientMessage);
const schema = buildSchema(`
  scalar JSON
  type Query { unused: Boolean }
  type Mutation { ${selectFields(mutations, ['posCoversRemove'])} }
`);
const resolver: GraphQLFieldResolver<undefined, IContext> =
  coverMutations.posCoversRemove;
const cover = { _id: 'cover', posToken: 'pos-token', status: 'confirm' };
const pos = { token: 'pos-token', onServer: true };

const createContext = () => ({
  subdomain: 'tenant',
  checkPermission: jest.fn().mockResolvedValue(undefined),
  models: {
    Covers: {
      getCover: jest.fn().mockResolvedValue(cover),
      deleteCover: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    },
    Pos: { getPos: jest.fn().mockResolvedValue(pos) },
  },
});

const removeCover = (contextValue: ReturnType<typeof createContext>) =>
  graphql({
    schema,
    source: 'mutation { posCoversRemove(_id: "cover") }',
    contextValue,
    fieldResolver: resolver,
  });

beforeEach(() => sendMessage.mockReset());

it('unpublishes the POS client cover before deleting its Sales copy', async () => {
  const context = createContext();
  sendMessage.mockImplementation(async () => {
    expect(context.models.Covers.deleteCover).not.toHaveBeenCalled();
    return { _id: 'cover', status: 'reconf' };
  });

  const result = await removeCover(context);

  expect(result.errors).toBeUndefined();
  expect(context.checkPermission).toHaveBeenCalledWith('posCoversRemove');
  expect(context.models.Pos.getPos).toHaveBeenCalledWith({
    token: 'pos-token',
  });
  expect(sendMessage).toHaveBeenCalledWith({
    subdomain: 'tenant',
    action: 'covers.remove',
    method: 'query',
    input: { cover },
    pos,
    throwOnError: true,
  });
  expect(context.models.Covers.deleteCover).toHaveBeenCalledWith('cover');
});

it.each([
  null,
  {},
  { _id: 'cover', status: 'confirm' },
  { _id: 'other-cover', status: 'reconf' },
])(
  'retains the Sales cover for an invalid acknowledgement: %j',
  async (reply) => {
    const context = createContext();
    sendMessage.mockResolvedValue(reply);

    const result = await removeCover(context);

    expect(result.errors?.[0].message).toBe(
      'Could not unpublish cover in POS client',
    );
    expect(context.models.Covers.deleteCover).not.toHaveBeenCalled();
  },
);

it('retains the Sales cover when POS client is unreachable', async () => {
  const context = createContext();
  sendMessage.mockRejectedValue(new Error('POS client unavailable'));

  const result = await removeCover(context);

  expect(result.errors?.[0].message).toBe('POS client unavailable');
  expect(context.models.Covers.deleteCover).not.toHaveBeenCalled();
});

it('checks permission before accessing or unpublishing a cover', async () => {
  const context = createContext();
  context.checkPermission.mockRejectedValue(new Error('Permission denied'));

  const result = await removeCover(context);

  expect(result.errors?.[0].message).toBe('Permission denied');
  expect(context.models.Covers.getCover).not.toHaveBeenCalled();
  expect(sendMessage).not.toHaveBeenCalled();
  expect(context.models.Covers.deleteCover).not.toHaveBeenCalled();
});
