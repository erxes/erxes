import { createTRPCUntypedClient } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { z } from 'zod';
import { createInternalHTTPBatchLink } from '../httpBatchLink';

const t = initTRPC.context<{ tenant: string | null }>().create();
const inputSchema = z.object({ value: z.string() });
const router = t.router({
  check: t.procedure.input(inputSchema).query(({ ctx, input }) => ({
    ...input,
    tenant: ctx.tenant,
  })),
  save: t.procedure.input(inputSchema).mutation(({ input }) => input),
});

const setup = () => {
  const requests: Request[] = [];
  const client = createTRPCUntypedClient({
    links: [
      createInternalHTTPBatchLink({
        url: 'http://plugin/trpc',
        headers: { 'x-test-tenant': 'tenant-1' },
        fetch: async (url, options) => {
          const req = new Request(url, options);
          requests.push(req.clone());
          return fetchRequestHandler({
            endpoint: '/trpc',
            req,
            router,
            allowMethodOverride: true,
            createContext: () => ({ tenant: req.headers.get('x-test-tenant') }),
          });
        },
      }),
    ],
  });
  return { client, requests };
};

describe('internal tRPC HTTP transport', () => {
  it('sends small queries in a POST body', async () => {
    const { client, requests } = setup();
    await expect(client.query('check', { value: 'small' })).resolves.toEqual({
      value: 'small',
      tenant: 'tenant-1',
    });
    expect(requests[0].method).toBe('POST');
    expect(new URL(requests[0].url).searchParams.has('input')).toBe(false);
    expect(await requests[0].json()).toEqual({ 0: { value: 'small' } });
  });

  it('sends a large query in a POST body without changing its procedure type', async () => {
    const { client, requests } = setup();
    const input = { value: 'x'.repeat(100_000) };
    await expect(client.query('check', input)).resolves.toEqual({
      ...input,
      tenant: 'tenant-1',
    });
    expect(requests[0].method).toBe('POST');
    expect(new URL(requests[0].url).searchParams.has('input')).toBe(false);
    expect(await requests[0].json()).toEqual({ 0: input });
  });

  it('preserves Unicode input in the JSON body', async () => {
    const { client, requests } = setup();
    const input = { value: '\u0430'.repeat(2000) };
    await expect(client.query('check', input)).resolves.toEqual({
      ...input,
      tenant: 'tenant-1',
    });
    expect(await requests[0].json()).toEqual({ 0: input });
  });

  it('batches queries in one POST body', async () => {
    const { client, requests } = setup();
    const input = { value: 'x'.repeat(5000) };
    await Promise.all([
      client.query('check', input),
      client.query('check', input),
    ]);
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('POST');
    expect(await requests[0].json()).toEqual({ 0: input, 1: input });
  });

  it('keeps mutations on POST', async () => {
    const { client, requests } = setup();
    await expect(client.mutation('save', { value: 'save' })).resolves.toEqual({
      value: 'save',
    });
    expect(requests[0].method).toBe('POST');
  });

  it('preserves input validation errors for POST queries', async () => {
    const { client } = setup();
    await expect(
      client.query('check', { value: 123, padding: 'x'.repeat(10_000) }),
    ).rejects.toMatchObject({ data: { code: 'BAD_REQUEST' } });
  });

  it('does not allow mutations over GET when method override is enabled', async () => {
    const input = encodeURIComponent(JSON.stringify({ value: 'invalid' }));
    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: new Request(`http://plugin/trpc/save?input=${input}`),
      router,
      allowMethodOverride: true,
      createContext: () => ({ tenant: 'tenant-1' }),
    });
    expect(response.status).toBe(405);
  });
});
