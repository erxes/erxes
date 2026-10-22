/**
 * GraphQL `internalNotesAdd` checks `internalNotesManage` before delegating to
 * the shared `addInternalNote` service.
 */

import { internalNoteMutations } from '~/modules/internalNote/graphql/mutations';
import { addInternalNote } from '~/modules/internalNote/services';

jest.mock('~/modules/internalNote/services', () => ({
  addInternalNote: jest.fn(),
}));

const mockedAddInternalNote = jest.mocked(addInternalNote);

describe('internalNotesAdd GraphQL resolver', () => {
  it('checks internalNotesManage before delegating to the shared service', async () => {
    const checkPermission = jest.fn(async () => undefined);
    const models = {} as never;
    const user = { _id: 'user1' };
    const args = {
      contentType: 'core:customer',
      contentTypeId: 'c1',
      content: 'note',
    };

    const note = { _id: 'note1' };
    mockedAddInternalNote.mockResolvedValue(note as never);

    const result = await internalNoteMutations.internalNotesAdd(
      undefined,
      args,
      { user, models, subdomain: 'os', checkPermission } as never,
    );

    expect(checkPermission).toHaveBeenCalledWith('internalNotesManage');
    expect(mockedAddInternalNote).toHaveBeenCalledWith({
      models,
      subdomain: 'os',
      user,
      doc: args,
    });
    expect(result).toBe(note);
  });

  it('does not delegate when the permission check fails', async () => {
    const checkPermission = jest.fn(async () => {
      throw new Error('Permission required');
    });
    mockedAddInternalNote.mockClear();

    await expect(
      internalNoteMutations.internalNotesAdd(
        undefined,
        { contentType: 'core:customer', contentTypeId: 'c1', content: 'x' },
        {
          user: { _id: 'user1' },
          models: {},
          subdomain: 'os',
          checkPermission,
        } as never,
      ),
    ).rejects.toThrow('Permission required');
    expect(mockedAddInternalNote).not.toHaveBeenCalled();
  });
});
