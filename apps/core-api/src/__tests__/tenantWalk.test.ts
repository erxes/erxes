import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Bodies that would pass validation, so a refusal comes from the tenant check. */
const BODIES: Partial<Record<string, object>> = {
  'customers.update': { firstName: 'pwned' },
  'companies.update': { primaryName: 'pwned' },
  'tags.update': { name: 'pwned' },
  'fields.update': { label: 'pwned' },
  'fieldGroups.update': { name: 'pwned' },
  'users.update': { fullName: 'pwned' },
  'users.setPassword': { password: 'Pwned-password-1' },
  'activities.updateNote': { body: 'pwned' },
};

/** The paths of core's OpenAPI document: each path's operations by HTTP method. */
const OpenApiPaths = z.object({
  paths: z.record(z.string(), z.record(z.string(), z.object({ operationId: z.string() }))),
});

/** Every procedure walked as organisation A (Acme) against organisation B's (Globex) records. */
describe('tenant isolation (API)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const theirs: Partial<Record<string, string>> = {};

  beforeAll(async () => {
    const b = t.other();

    const customer = await b.customers.create({
      firstName: 'Secret',
      primaryEmail: 'secret@globex.mn',
    });

    const note = await b.activities.addNote({
      targetType: 'customer',
      targetId: customer.id,
      body: 'b only',
    });

    Object.assign(theirs, {
      customers: customer.id,
      companies: (await b.companies.create({ primaryName: 'Globex LLC' })).id,
      tags: (await b.tags.create({ type: 'customer', name: 'vip', colorCode: '#ff0000' })).id,
      fieldGroups: (await b.fieldGroups.create({ contentType: 'customer', name: 'Private' })).id,
      fields: (await b.fields.create({ contentType: 'customer', label: 'Salary', type: 'number' }))
        .id,
      users: t.ids.otherOwner,
      files: (await b.files.createUpload({ name: 'b.txt', contentType: 'text/plain', size: 3 }))
        .file.id,
      activities: note.id,
      notifications: note.id,
    });
  });

  it("walks every procedure with an id as organisation A against B's records: none succeeds", async () => {
    const headers = { ...t.headers(await t.token()), 'content-type': 'application/json' };
    const walked: { procedure: string; ok: boolean }[] = [];

    const { paths } = OpenApiPaths.parse(
      await (await fetch(t.url('/core/v1/openapi.json'))).json(),
    );

    const routes = Object.entries(paths).flatMap(([path, operations]) =>
      Object.entries(operations).map(([method, operation]) => ({
        name: operation.operationId,
        group: operation.operationId.split('.')[0] ?? '',
        method: method.toUpperCase(),
        path,
      })),
    );

    for (const route of routes) {
      const id = theirs[route.group];

      if (!route.path.includes('{id}') || id === undefined) continue;

      const path = route.path.replace('{id}', id).replace('{companyId}', theirs.companies ?? '');
      const hasBody = route.method !== 'GET' && route.method !== 'DELETE';

      const response = await fetch(t.url(`/core/v1${path}`), {
        method: route.method,
        headers,
        body: hasBody ? JSON.stringify(BODIES[route.name] ?? {}) : undefined,
      });

      walked.push({ procedure: route.name, ok: response.ok });
    }

    expect(walked.length).toBeGreaterThan(20);
    expect(walked.filter((each) => each.ok)).toEqual([]);

    // And B's data is as it was.
    expect((await t.other().customers.get({ id: theirs.customers ?? '' })).firstName).toBe(
      'Secret',
    );
    expect((await t.other().tags.list({ type: 'customer' })).data.map((tag) => tag.name)).toEqual([
      'vip',
    ]);
  });

  it("lists only the caller's organisation", async () => {
    const a = t.owner();

    const lists = {
      customers: await a.customers.list({}),
      companies: await a.companies.list({}),
      tags: await a.tags.list({ type: 'customer' }),
      fields: await a.fields.list({ contentType: 'customer' }),
      users: await a.users.list({}),
      audit: await a.audit.list({}),
      events: await a.events.list({}),
    };

    for (const [list, page] of Object.entries(lists)) {
      const text = JSON.stringify(page);

      const leaked = [t.ids.otherOrg, ...Object.values(theirs)].filter(
        (id) => id !== undefined && text.includes(id),
      );

      expect({ list, leaked }).toEqual({ list, leaked: [] });
    }
  });
});
