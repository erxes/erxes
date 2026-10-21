import { ApolloServer } from '@apollo/server';
import express from 'express';
import type { IncomingMessage, Server } from 'http';
import {
  credentialGraphqlBoundary,
  credentialPrivacyPlugin,
} from '../credentialPrivacy';

const marker = 'synthetic-vault-input';

describe('credential GraphQL privacy', () => {
  let server: ApolloServer;

  beforeEach(async () => {
    server = new ApolloServer({
      documentStore: null,
      typeDefs: `
        input VaultInput { value: String!, enabled: Boolean }
        type Query { credentialsDetail(_id: String!): String, ordinary: String }
        type Mutation { credentialsCreate(input: VaultInput!): String! }
      `,
      resolvers: {
        Query: { ordinary: () => 'unchanged' },
        Mutation: {
          credentialsCreate: (
            _root: unknown,
            args: { input: { value: string } },
          ) => {
            throw new Error(args.input.value);
          },
        },
      },
      plugins: [credentialPrivacyPlugin],
    });
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it.each([
    {
      query: `mutation { alias: credentialsCreate(input: {value: "${marker}"}) }`,
    },
    {
      query:
        'mutation Vault($input: VaultInput!) { credentialsCreate(input: $input) }',
      variables: { input: { value: marker, enabled: marker } },
    },
    { query: `mutation { credentialsCreate(input: {value: "${marker}"})` },
  ])(
    'redacts resolver, coercion and parse failures and disables HTTP caching',
    async (request) => {
      const response = await server.executeOperation(request);
      expect(response.http.headers.get('cache-control')).toBe('no-store');
      expect(JSON.stringify(response.body)).not.toContain(marker);
      expect(JSON.stringify(response.body)).toContain(
        'CREDENTIAL_REQUEST_FAILED',
      );
    },
  );

  it('does not register sensitive automatic persisted queries', async () => {
    const response = await server.executeOperation({
      query: 'query { credentialsDetail(_id: "fixture") }',
      extensions: {
        persistedQuery: { version: 1, sha256Hash: 'invalid-hash' },
      },
    });
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single')
      expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.http.headers.get('cache-control')).toBe('no-store');
  });

  it('preserves ordinary GraphQL behavior', async () => {
    const response = await server.executeOperation({ query: '{ ordinary }' });
    expect(response.http.headers.get('pragma')).not.toBe('no-cache');
    if (response.body.kind === 'single')
      expect(response.body.singleResult.data).toEqual({
        ordinary: 'unchanged',
      });
  });
});

describe('credential HTTP parser boundary', () => {
  let server: Server;
  let url: string;

  beforeEach(async () => {
    const app = express();
    app.use('/graphql', credentialGraphqlBoundary);
    app.use('/graphql', (req, res) => {
      const request: IncomingMessage & { rawBody?: Buffer } = req;
      res.json({
        hasRawBody: Boolean(request.rawBody),
        parsed: Boolean(req.body),
      });
    });
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No test listener');
    url = `http://127.0.0.1:${address.port}/graphql`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it('does not retain raw vault inputs, including JSON-escaped operation names', async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:
        '{"query":"mutation { cr\\u0065dentialsCreate }","variables":{"value":"' +
        marker +
        '"}}',
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ hasRawBody: false, parsed: true });
  });

  it('handles malformed credential JSON without exposing the parser error or body', async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"query":"credentialsCreate", "value":"${marker}"`,
    });
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).not.toContain(marker);
  });

  it('rejects credential requests in URLs', async () => {
    const response = await fetch(`${url}?query=credentialsDetail`);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('preserves raw-body capture for existing operations', async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"query":"{ ordinary }"}',
    });
    expect(await response.json()).toEqual({ hasRawBody: true, parsed: true });
  });
});
