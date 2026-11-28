import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { useTestDatabase } from './db';
import { useTestServer } from './support';

const Reference = z.object({
  info: z.object({ title: z.string() }),
  paths: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({ tags: z.array(z.string()), security: z.array(z.unknown()).optional() }),
    ),
  ),
  components: z.object({
    securitySchemes: z.record(z.string(), z.unknown()),
    schemas: z.record(z.string(), z.unknown()),
  }),
  security: z.array(z.record(z.string(), z.array(z.string()))),
});

/** `GET /customers`-style names of every operation in a document. */
const operations = (doc: z.infer<typeof Reference>) =>
  Object.entries(doc.paths).flatMap(([path, methods]) =>
    Object.keys(methods).map((method) => `${method.toUpperCase()} ${path}`),
  );

describe('API references (/core/v1/openapi/<audience>.json)', () => {
  useTestDatabase();

  const server = useTestServer();

  const reference = async (audience: string) => {
    const response = await fetch(server.url(`/core/v1/openapi/${audience}.json`));

    expect(response.status).toBe(200);

    return Reference.parse(await response.json());
  };

  it("lists what members can call, by section, and no customer's or plugin's routes", async () => {
    const doc = await reference('member');
    const listed = operations(doc);

    expect(listed).toEqual(
      expect.arrayContaining(['GET /customers', 'POST /auth/sign-in', 'GET /users']),
    );
    expect(listed.filter((name) => / \/portal(-auth)?\//.test(name))).toEqual([]);
    expect(listed).not.toContain('POST /plugins/token');
    expect(listed).not.toContain('POST /activities');
    expect(doc.paths['/customers']?.get?.tags).toEqual(['Customers']);
    expect(doc.paths['/auth/sign-in']?.post?.security).toEqual([]);
    expect(Object.keys(doc.components.securitySchemes)).toEqual(['memberToken']);
  });

  it("lists what a portal's apps call: its token, sign-in and the customer's own account", async () => {
    const doc = await reference('portal');
    const listed = operations(doc);

    expect(listed).toEqual(
      expect.arrayContaining([
        'POST /portal-auth/token',
        'POST /portal/auth/code',
        'POST /portal/contact',
        'GET /portal/me',
      ]),
    );
    expect(doc.paths['/portal/contact']?.post?.security).toEqual([{ portalToken: [] }]);
    expect(listed.every((name) => /^\w+ \/portal(-auth)?\//.test(name))).toBe(true);
    expect(doc.paths['/portal/me']?.get?.tags).toEqual(['Customer account']);
    expect(doc.paths['/portal/auth/code']?.post?.security).toEqual([{ portalToken: [] }]);
    expect(doc.paths['/portal-auth/token']?.post?.security).toEqual([]);
    expect(doc.security).toEqual([{ portalToken: [], customerToken: [] }]);
    expect(Object.keys(doc.components.schemas)).not.toContain('Invoice');
  });

  it('serves no other audience', async () => {
    expect((await fetch(server.url('/core/v1/openapi/plugin.json'))).status).not.toBe(200);
  });
});
