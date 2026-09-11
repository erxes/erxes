import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { documentQueries } from '../graphql/queries';

jest.mock('erxes-api-shared/utils', () => ({ cursorPaginate: jest.fn() }));
jest.mock('~/meta/documents', () => ({ documents: {} }), { virtual: true });

const document = {
  _id: 'document-1',
  createdUserId: 'creator-1',
  name: 'Template',
  content: 'Private content',
  replacer: 'Private replacer',
};
const getStates = jest.fn();
const getState = jest.fn();
const context = {
  models: { Documents: {}, ApprovalLocks: { getStates, getState } },
  user: { _id: 'reader-1' },
  checkPermission: jest.fn(),
} as unknown as IContext;
const params = { limit: 20, contentType: 'core:documents' };

/** Missing batch states must be rechecked without implicitly granting access. */
describe('document list approval access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(cursorPaginate).mockResolvedValue({
      list: [document],
      totalCount: 1,
      pageInfo: {},
    } as unknown as Awaited<ReturnType<typeof cursorPaginate>>);
    getStates.mockResolvedValue([]);
  });

  it.each([true, false])(
    'rechecks a missing state with hasAccess=%s',
    async (hasAccess) => {
      getState.mockResolvedValue({ contentId: document._id, hasAccess });
      const result = await documentQueries.documents(
        undefined,
        params,
        context,
      );

      expect(getState).toHaveBeenCalledWith({
        user: context.user,
        contentType: 'core:documents',
        contentId: document._id,
        ownerId: document.createdUserId,
        action: 'view',
      });
      expect(result.list[0].content).toBe(hasAccess ? document.content : null);
      expect(result.list[0].replacer).toBe(
        hasAccess ? document.replacer : null,
      );
      expect(result.totalCount).toBe(1);
    },
  );

  it('uses the batch state without another lookup', async () => {
    getStates.mockResolvedValue([
      { contentId: document._id, hasAccess: false },
    ]);
    const result = await documentQueries.documents(undefined, params, context);
    expect(getState).not.toHaveBeenCalled();
    expect(result.list[0].content).toBeNull();
  });

  it('does not return document content when the fallback check fails', async () => {
    getState.mockRejectedValue(new Error('Approval unavailable'));
    await expect(
      documentQueries.documents(undefined, params, context),
    ).rejects.toThrow('Approval unavailable');
  });
});
