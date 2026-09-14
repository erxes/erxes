import { IncomingHttpHeaders } from 'http';
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
    loginToken: 'jwt.'.repeat(200),
  };

  it('forwards identity, permissions and oauth scopes but not profile bulk', () => {
    const headers: IncomingHttpHeaders = {};
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
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, {
      ...user,
      oauthScopes: Array.from(
        { length: 120 },
        (_, i) => `plugin-module${i}:manage`,
      ),
    });

    expect(String(headers.user).length).toBeLessThan(8 * 1024);
  });

  it('warns before a header outgrows the service budget', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const headers: IncomingHttpHeaders = {};

    setUserHeader(headers, {
      ...user,
      departmentIds: Array(4000).fill('d'.repeat(10)),
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('u1');
    warn.mockRestore();
  });

  it("does not mutate the caller's user object", () => {
    const copy = { ...user };
    compactUserForHeader(copy);
    expect(copy.emailSignatures).toBeDefined();
  });
});
