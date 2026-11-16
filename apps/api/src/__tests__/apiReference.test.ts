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
    expect(listed.filter((name) => /\/customer(-auth)?\//.test(name))).toEqual([]);
    expect(listed).not.toContain('POST /plugins/token');
    expect(listed).not.toContain('POST /activities');
    expect(doc.paths['/customers']?.get?.tags).toEqual(['Customers']);
    expect(doc.paths['/auth/sign-in']?.post?.security).toEqual([]);
    expect(Object.keys(doc.components.securitySchemes)).toEqual(['memberToken']);
  });

  it('lists what customers can call: sign-in and their own account', async () => {
    const doc = await reference('customer');
    const listed = operations(doc);

    expect(listed).toEqual(
      expect.arrayContaining(['POST /customer-auth/code', 'GET /customer/me']),
    );
    expect(listed.every((name) => /^\w+ \/customer(-auth)?\//.test(name))).toBe(true);
    expect(doc.paths['/customer/me']?.get?.tags).toEqual(['Customer account']);
    expect(Object.keys(doc.components.schemas)).not.toContain('Invoice');
  });

  it('serves no other audience', async () => {
    expect((await fetch(server.url('/core/v1/openapi/plugin.json'))).status).not.toBe(200);
  });
});
