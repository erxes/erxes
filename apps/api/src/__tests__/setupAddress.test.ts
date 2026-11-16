import { request } from 'node:http';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTestServer } from './support';

const owner = {
  organizationName: 'Acme LLC',
  firstName: 'Bat',
  email: 'owner@acme.mn',
  password: 'Secret-pass1',
};

describe('first-run setup at an address', () => {
  useTestDatabase();

  const server = useTestServer();

  /** POSTs JSON as if to office.example.com: fetch drops a Host header, node:http keeps it. */
  const post = (path: string, body: Partial<typeof owner>) =>
    new Promise<unknown>((resolve, reject) => {
      const call = request(
        server.url(`/core/v1${path}`),
        {
          method: 'POST',
          headers: {
            host: 'office.example.com',
            'content-type': 'application/json',
            'sec-fetch-site': 'same-origin',
          },
        },
        (response) => {
          let text = '';

          response.setEncoding('utf8');
          response.on('data', (chunk: string) => (text += chunk));
          response.on('end', () => resolve(JSON.parse(text)));
        },
      );

      call.on('error', reject);
      call.end(JSON.stringify(body));
    });

  it('takes the subdomain sign-in reads from that address, so the owner can sign in again', async () => {
    expect(await post('/setup', owner)).toMatchObject({
      organization: { name: 'Acme LLC', subdomain: 'office' },
    });
    expect(
      await post('/auth/sign-in', { email: owner.email, password: owner.password }),
    ).toMatchObject({ user: { email: owner.email }, organization: { subdomain: 'office' } });
  });
});
