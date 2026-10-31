import { redactLogPayload } from '../redactLogPayload';

describe('redactLogPayload', () => {
  it('redacts nested credential values', () => {
    const payload = {
      mutationName: 'authLdapConfigSave',
      args: {
        doc: { url: 'ldap://host', bindPassword: 'plain' },
        currentPassword: 'old',
        newPassword: 'new',
        clientSecret: 's',
        apiKey: 'k',
        api_key: 'k2',
      },
    };

    expect(redactLogPayload(payload)).toEqual({
      mutationName: 'authLdapConfigSave',
      args: {
        doc: { url: 'ldap://host', bindPassword: '[redacted]' },
        currentPassword: '[redacted]',
        newPassword: '[redacted]',
        clientSecret: '[redacted]',
        apiKey: '[redacted]',
        api_key: '[redacted]',
      },
    });
  });

  it('keeps boolean flags and empty values', () => {
    const payload = { result: { hasBindPassword: true, password: null } };

    expect(redactLogPayload(payload)).toEqual(payload);
  });

  it('drops credential headers and keeps client info headers', () => {
    const headers = {
      cookie: 'auth-token=jwt',
      Authorization: 'Bearer jwt',
      'x-api-key': 'k',
      'x-app-token': 'app',
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '1.2.3.4',
      host: 'example.com',
      'user-agent': 'Mozilla/5.0',
    };

    expect(
      redactLogPayload({ headers, requestData: headers, method: 'ldap' }),
    ).toEqual({
      headers: {
        'x-app-token': '[redacted]',
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '1.2.3.4',
        host: 'example.com',
        'user-agent': 'Mozilla/5.0',
      },
      requestData: {
        'x-app-token': '[redacted]',
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '1.2.3.4',
        host: 'example.com',
        'user-agent': 'Mozilla/5.0',
      },
      method: 'ldap',
    });
  });

  it('redacts inside arrays and toJSON output', () => {
    const doc = { toJSON: () => ({ _id: 'u1', password: 'hash' }) };

    expect(
      redactLogPayload({ result: [doc], args: [{ token: 't' }] }),
    ).toEqual({
      result: [{ _id: 'u1', password: '[redacted]' }],
      args: [{ token: '[redacted]' }],
    });
  });

  it('returns empty payloads as is', () => {
    expect(redactLogPayload(null)).toBeNull();
    expect(redactLogPayload(undefined)).toBeUndefined();
  });
});
