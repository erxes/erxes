import {
  filesAccessSchema,
  principalTypeOf,
  toFormGrant,
  toGrantInput,
} from '../filesAccessForm';

describe('files access form', () => {
  it('accepts everyone without an id but asks anyone else for one', () => {
    expect(
      filesAccessSchema.safeParse({
        restricted: false,
        access: [{ type: 'everyone', role: 'viewer' }],
      }).success,
    ).toBe(true);

    const missingUser = filesAccessSchema.safeParse({
      restricted: false,
      access: [{ type: 'user', role: 'viewer' }],
    });

    expect(missingUser.success).toBe(false);
    expect(missingUser.error?.issues[0].path).toEqual(['access', 0, 'id']);
  });

  it('rejects roles and principals the server does not know', () => {
    expect(
      filesAccessSchema.safeParse({
        restricted: false,
        access: [{ type: 'position', id: 'p1', role: 'viewer' }],
      }).success,
    ).toBe(false);
    expect(
      filesAccessSchema.safeParse({
        restricted: false,
        access: [{ type: 'user', id: 'u1', role: 'owner' }],
      }).success,
    ).toBe(false);
  });

  it('sends no id for everyone and drops Apollo typenames', () => {
    expect(
      toGrantInput({ type: 'everyone', id: 'stale', role: 'viewer' }),
    ).toEqual({
      type: 'everyone',
      role: 'viewer',
    });
    const fromApollo = {
      type: 'unit' as const,
      id: null,
      role: 'manager' as const,
      __typename: 'FilesAccessGrant',
    };

    expect(toFormGrant(fromApollo)).toEqual({
      type: 'unit',
      id: undefined,
      role: 'manager',
    });
  });

  it('only takes known principal types', () => {
    expect(principalTypeOf('department')).toBe('department');
    expect(principalTypeOf('position')).toBeUndefined();
  });
});
