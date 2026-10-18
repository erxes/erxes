/**
 * `internalNotes.add` — the agent-facing internal-note write tool, plus the
 * `textToNoteBlocks` conversion and the GraphQL `internalNotesAdd` delegation.
 *
 * The guarantees under test:
 *
 * - writes run as the acting user (UNAUTHORIZED otherwise);
 * - the target record must exist (NOT_FOUND), with sales deals resolved
 *   through the sales plugin's tRPC contract;
 * - plain text is always converted to BlockNote paragraph blocks — raw text
 *   is never stored (the UI's fallback is dangerouslySetInnerHTML);
 * - a disabled owning plugin surfaces as PRECONDITION_FAILED;
 * - GraphQL `internalNotesAdd` still checks `internalNotesManage` before
 *   delegating to the shared service.
 */

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { CoreTRPCContext } from '~/init-trpc';
import { internalNoteMutations } from '~/modules/internalNote/graphql/mutations';
import { addInternalNote } from '~/modules/internalNote/services';
import {
  internalNoteTrpcRouter,
  textToNoteBlocks,
} from '~/modules/internalNote/trpc/internalNote';

jest.mock('~/modules/internalNote/services', () => ({
  addInternalNote: jest.fn(),
}));

// Mock the submodule, not the barrel: mocking 'erxes-api-shared/utils'
// itself hits a circular self-import while the barrel is still loading.
jest.mock('erxes-api-shared/utils/trpc', () => ({
  ...jest.requireActual('erxes-api-shared/utils/trpc'),
  sendTRPCMessage: jest.fn(),
}));

const mockedAddInternalNote = jest.mocked(addInternalNote);
const mockedSendTRPCMessage = jest.mocked(sendTRPCMessage);

const actingUser = { _id: 'user1', email: 'agent@erxes.io' };

const leanable = <T>(value: T) => ({
  lean: jest.fn(async () => value),
});

const buildCaller = ({
  userId = 'user1',
  foundUser = actingUser,
  foundTarget = { _id: 'c1' } as unknown,
}: {
  userId?: string;
  foundUser?: unknown;
  foundTarget?: unknown;
} = {}) => {
  const models = {
    Users: { findOne: jest.fn(() => leanable(foundUser)) },
    Customers: { findOne: jest.fn(() => leanable(foundTarget)) },
    Companies: { findOne: jest.fn(() => leanable(foundTarget)) },
  };

  const caller = internalNoteTrpcRouter.createCaller({
    subdomain: 'os',
    userId,
    models,
  } as unknown as CoreTRPCContext);

  return { caller, models };
};

const agentMetaOf = (path: string) =>
  (
    internalNoteTrpcRouter._def.procedures[path] as {
      _def: { meta?: { agent?: { permission?: unknown } } };
    }
  )._def.meta?.agent;

describe('internalNotes.add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAddInternalNote.mockImplementation(async ({ doc }) => ({
      _id: 'note1',
      ...doc,
    }));
  });

  it('rejects UNAUTHORIZED without an acting user', async () => {
    const { caller, models } = buildCaller({ userId: '' });

    await expect(
      caller.internalNotes.add({
        contentType: 'core:customer',
        contentTypeId: 'c1',
        content: 'hello',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(models.Users.findOne).not.toHaveBeenCalled();
    expect(mockedAddInternalNote).not.toHaveBeenCalled();
  });

  it('rejects NOT_FOUND when the customer does not exist', async () => {
    const { caller } = buildCaller({ foundTarget: null });

    await expect(
      caller.internalNotes.add({
        contentType: 'core:customer',
        contentTypeId: 'missing',
        content: 'hello',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mockedAddInternalNote).not.toHaveBeenCalled();
  });

  it('resolves a sales deal target through the sales plugin contract', async () => {
    const { caller } = buildCaller();
    mockedSendTRPCMessage.mockResolvedValue({ _id: 'deal1' });

    await caller.internalNotes.add({
      contentType: 'sales:deal',
      contentTypeId: 'deal1',
      content: 'note on a deal',
    });

    expect(mockedSendTRPCMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'os',
        pluginName: 'sales',
        method: 'query',
        module: 'deal',
        action: 'findOne',
        input: { _id: 'deal1' },
        defaultValue: null,
      }),
    );
    expect(mockedAddInternalNote).toHaveBeenCalled();
  });

  it('stores the content as BlockNote paragraphs and returns the note', async () => {
    const { caller } = buildCaller();

    const note = await caller.internalNotes.add({
      contentType: 'core:customer',
      contentTypeId: 'c1',
      content: 'first line\n\nsecond line',
    });

    const { doc } = mockedAddInternalNote.mock.calls[0][0];
    expect(doc.contentType).toBe('core:customer');
    expect(doc.contentTypeId).toBe('c1');
    expect(doc.mentionedUserIds).toEqual([]);

    const blocks = JSON.parse(doc.content);
    expect(blocks).toHaveLength(3);
    expect(blocks[0].type).toBe('paragraph');
    expect(blocks[0].content[0].text).toBe('first line');
    expect(blocks[1].content).toEqual([]);
    expect(blocks[2].content[0].text).toBe('second line');

    expect(note).toMatchObject({ _id: 'note1', contentTypeId: 'c1' });
  });

  it('maps a null service result (plugin disabled) to PRECONDITION_FAILED', async () => {
    const { caller } = buildCaller();
    mockedAddInternalNote.mockResolvedValue(null);

    await expect(
      caller.internalNotes.add({
        contentType: 'core:customer',
        contentTypeId: 'c1',
        content: 'hello',
      }),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });

  it('does not expose agent metadata', () => {
    expect(agentMetaOf('internalNotes.add')).toBeUndefined();
  });
});

describe('textToNoteBlocks', () => {
  it('produces one paragraph block per line and keeps markup as inert text', () => {
    const blocks = JSON.parse(
      textToNoteBlocks('hello\n<script>alert(1)</script>'),
    );

    expect(blocks).toHaveLength(2);
    expect(blocks[1].content).toEqual([
      { type: 'text', text: '<script>alert(1)</script>', styles: {} },
    ]);
    for (const block of blocks) {
      expect(block.id).toBeTruthy();
      expect(block.children).toEqual([]);
    }
  });

  it('trims leading and trailing empty lines but keeps interior blanks', () => {
    const blocks = JSON.parse(textToNoteBlocks('\n\na\n\nb\n\n')) as {
      content: { text: string }[];
    }[];

    expect(blocks.map((b) => b.content.map((c) => c.text))).toEqual([
      ['a'],
      [],
      ['b'],
    ]);
  });
});

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
