import {
  compactUserForHeader,
  extractUserFromHeader,
  setUserHeader,
  USER_HEADER_OMITTED_FIELDS,
} from './user';

describe('user header', () => {
  const user = {
    _id: 'u1',
    email: 'mj@example.com',
    isOwner: true,
    groupIds: ['g1'],
    oauthScopes: ['sales-deal:manage', 'contacts:read'],
    emailSignatures: [{ brandId: 'b1', signature: 'x'.repeat(4000) }],
    customFieldsData: [{ field: 'f1', value: 'y'.repeat(3000) }],
    propertiesData: [{ field: 'f2', value: 'z' }],
    links: { website: 'https://example.com' },
  };

  it('forwards identity, permissions and oauth scopes but not profile bulk', () => {
    const headers: Record<string, any> = {};
    setUserHeader(headers, user);
    const forwarded = extractUserFromHeader(headers);

    expect(forwarded._id).toBe('u1');
    expect(forwarded.isOwner).toBe(true);
    expect(forwarded.groupIds).toEqual(['g1']);
    expect(forwarded.oauthScopes).toEqual([
      'sales-deal:manage',
      'contacts:read',
    ]);
    expect(headers.userid).toBe('u1');

    for (const field of USER_HEADER_OMITTED_FIELDS) {
      expect(forwarded).not.toHaveProperty(field);
    }
  });

  it('keeps the header well under the default 16 KB request-header limit', () => {
    const headers: Record<string, any> = {};
    setUserHeader(headers, {
      ...user,
      oauthScopes: Array.from(
        { length: 120 },
        (_, i) => `plugin-module${i}:manage`,
      ),
    });

    expect(String(headers.user).length).toBeLessThan(8 * 1024);
  });

  it("does not mutate the caller's user object", () => {
    const copy = { ...user };
    compactUserForHeader(copy);
    expect(copy.emailSignatures).toBeDefined();
  });
});
