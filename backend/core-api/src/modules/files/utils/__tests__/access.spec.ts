import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { FILES_MAX_GRANTS } from '@/files/constants';
import {
  assertRole,
  FILE_GRANT_ROLES,
  fileAccessFields,
  mergeAccess,
  myRole,
  normalizeGrants,
  roleOf,
  TFilesActor,
  toAccessFields,
  toGrant,
  toRoleMap,
  withOwnerGrant,
} from '../access';

// Keeps the real ExpectedError but no Redis or queue connection.
jest.mock('erxes-api-shared/utils', () => ({
  ExpectedError: jest.requireActual('erxes-api-shared/utils/errorClassifier')
    .ExpectedError,
  redis: { get: jest.fn(), set: jest.fn() },
  sendWorkerQueue: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({ canGroup: jest.fn() }));

const addLog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  addLog.mockResolvedValue(undefined);
  jest.mocked(sendWorkerQueue).mockReturnValue({
    add: addLog,
  } as unknown as ReturnType<typeof sendWorkerQueue>);
});

const expectAccessError = (fn: () => unknown, code: string) => {
  try {
    fn();
  } catch (error) {
    expect(error).toMatchObject({ code, isExpected: true });
    return;
  }

  throw new Error(`Expected ${code}`);
};

describe('normalizeGrants', () => {
  it('keeps one grant per principal with the highest role', () => {
    const grants = normalizeGrants([
      { type: 'user', id: 'u1', role: 'manager' },
      { type: 'user', id: 'u1', role: 'viewer' },
      { type: 'department', id: 'd1', role: 'viewer' },
      { type: 'department', id: 'd1', role: 'contributor' },
    ]);

    expect(grants).toEqual([
      { type: 'user', id: 'u1', role: 'manager', key: 'user:u1' },
      {
        type: 'department',
        id: 'd1',
        role: 'contributor',
        key: 'department:d1',
      },
    ]);
  });

  it('gives everyone a single key without an id', () => {
    expect(
      normalizeGrants([{ type: 'everyone', id: 'x', role: 'viewer' }]),
    ).toEqual([{ type: 'everyone', role: 'viewer', key: 'everyone' }]);
  });

  it.each([
    ['an unknown principal type', { type: 'group', id: 'g1', role: 'viewer' }],
    ['an unknown role', { type: 'user', id: 'u1', role: 'owner' }],
    ['a missing id', { type: 'branch', role: 'viewer' }],
  ])('rejects %s', (_, grant) => {
    expectAccessError(() => normalizeGrants([grant]), 'FILES_INVALID_ACCESS');
  });

  it('rejects a role outside the allowed set', () => {
    expectAccessError(
      () =>
        normalizeGrants(
          [{ type: 'user', id: 'u1', role: 'contributor' }],
          FILE_GRANT_ROLES,
        ),
      'FILES_INVALID_ACCESS',
    );
  });

  it('counts grants after merging duplicates', () => {
    const grants = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        type: 'user',
        id: `u${i}`,
        role: 'viewer',
      }));

    expect(
      normalizeGrants([...grants(FILES_MAX_GRANTS), ...grants(5)]),
    ).toHaveLength(FILES_MAX_GRANTS);
    expectAccessError(
      () => normalizeGrants(grants(FILES_MAX_GRANTS + 1)),
      'FILES_INVALID_ACCESS',
    );
  });
});

describe('withOwnerGrant', () => {
  it('replaces any lower owner grant with manager', () => {
    expect(
      withOwnerGrant(
        [
          { type: 'user', id: 'owner', role: 'viewer' },
          { type: 'department', id: 'owner', role: 'viewer' },
        ],
        'owner',
      ),
    ).toEqual([
      { type: 'department', id: 'owner', role: 'viewer' },
      { type: 'user', id: 'owner', role: 'manager' },
    ]);
  });

  it('leaves grants alone without an owner', () => {
    const grants = [{ type: 'user', id: 'u1', role: 'viewer' }];

    expect(withOwnerGrant(grants)).toBe(grants);
  });
});

describe('mergeAccess and toAccessFields', () => {
  it('lets a folder raise but never lower an inherited role', () => {
    const inherited = toRoleMap({
      readers: ['everyone', 'user:a', 'user:b'],
      contributors: ['user:a', 'user:b'],
      managers: ['user:b'],
    });
    const merged = mergeAccess(inherited, [
      toGrant('user', 'manager', 'a'),
      toGrant('user', 'viewer', 'b'),
      toGrant('unit', 'contributor', 'n1'),
    ]);

    expect(toAccessFields(merged)).toEqual({
      readers: ['everyone', 'unit:n1', 'user:a', 'user:b'],
      contributors: ['unit:n1', 'user:a', 'user:b'],
      managers: ['user:a', 'user:b'],
    });
  });

  it('starts empty with nothing inherited', () => {
    expect(
      toAccessFields(mergeAccess(null, [toGrant('everyone', 'viewer')])),
    ).toEqual({
      readers: ['everyone'],
      contributors: [],
      managers: [],
    });
  });
});

describe('fileAccessFields', () => {
  it('adds own grants to the folder access; only manager grants manage', () => {
    expect(
      fileAccessFields(
        { readers: ['user:o', 'everyone'], managers: ['user:o'] },
        [
          toGrant('user', 'viewer', 'v'),
          toGrant('branch', 'manager', 'b1'),
          toGrant('user', 'manager', 'o'),
        ],
      ),
    ).toEqual({
      readers: ['branch:b1', 'everyone', 'user:o', 'user:v'],
      managers: ['branch:b1', 'user:o'],
    });
  });
});

describe('roleOf', () => {
  const item = {
    readers: ['everyone', 'user:c', 'user:m'],
    contributors: ['user:c', 'user:m'],
    managers: ['user:m'],
  };

  it.each([
    [['user:m'], 'manager'],
    [['user:c'], 'contributor'],
    [['everyone', 'user:x'], 'viewer'],
    [['user:x'], null],
  ])('%j holds %s', (principals, role) => {
    expect(roleOf(item, principals)).toBe(role);
  });

  it('treats missing lists as no access', () => {
    expect(roleOf({}, ['everyone'])).toBeNull();
  });
});

describe('assertRole', () => {
  const actor = (principals: string[], isAdmin = false): TFilesActor => ({
    subdomain: 'acme',
    userId: 'u1',
    principals,
    isAdmin,
  });
  const item = {
    _id: 'f1',
    readers: ['user:v', 'user:m'],
    contributors: ['user:m'],
    managers: ['user:m'],
  };

  it('passes when the actor holds the role or a higher one', () => {
    expect(() =>
      assertRole(actor(['user:m']), item, 'contributor', 'upload', 'folder'),
    ).not.toThrow();
    expect(() =>
      assertRole(actor(['user:v']), item, 'viewer', 'download', 'file'),
    ).not.toThrow();
    expect(sendWorkerQueue).not.toHaveBeenCalled();
  });

  it('hides an item from someone with no role as NOT_FOUND', () => {
    expectAccessError(
      () => assertRole(actor(['user:x']), item, 'viewer', 'download', 'file'),
      'NOT_FOUND',
    );
  });

  it('refuses a too-low role with FILES_FORBIDDEN', () => {
    expectAccessError(
      () => assertRole(actor(['user:v']), item, 'manager', 'share', 'folder'),
      'FILES_FORBIDDEN',
    );
  });

  it('lets an admin read without a role and logs it', () => {
    expect(() =>
      assertRole(actor(['user:x'], true), item, 'viewer', 'download', 'file'),
    ).not.toThrow();
    expect(addLog).toHaveBeenCalledWith(
      'put_log',
      expect.objectContaining({
        action: 'filesAdminAccess',
        userId: 'u1',
        payload: {
          operation: 'download',
          items: [{ itemType: 'file', _id: 'f1' }],
          count: 1,
        },
      }),
      expect.anything(),
    );
  });

  it('gives an admin no rights beyond reading', () => {
    expectAccessError(
      () =>
        assertRole(actor(['user:x'], true), item, 'manager', 'share', 'file'),
      'NOT_FOUND',
    );
    expectAccessError(
      () =>
        assertRole(
          actor(['user:v'], true),
          item,
          'contributor',
          'upload',
          'folder',
        ),
      'FILES_FORBIDDEN',
    );
    expect(sendWorkerQueue).not.toHaveBeenCalled();
  });

  it('lets an admin manage the ownerless Org drive root only', () => {
    const orgRoot = { _id: 'root', rootKey: 'org', readers: ['everyone'] };
    const myRoot = { _id: 'mine', rootKey: 'user:u2', readers: ['user:u2'] };

    expect(() =>
      assertRole(actor(['everyone'], true), orgRoot, 'manager', 'setAccess', 'folder'),
    ).not.toThrow();
    expect(myRole(actor(['everyone'], true), orgRoot)).toBe('manager');
    expect(myRole(actor(['everyone']), orgRoot)).toBe('viewer');
    expectAccessError(
      () => assertRole(actor(['everyone']), orgRoot, 'contributor', 'createFolder', 'folder'),
      'FILES_FORBIDDEN',
    );
    expectAccessError(
      () => assertRole(actor(['everyone'], true), myRoot, 'contributor', 'upload', 'folder'),
      'NOT_FOUND',
    );
  });
});
