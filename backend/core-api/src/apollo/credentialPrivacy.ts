import type { ApolloServerPlugin } from '@apollo/server';
import { containsCredentialTraffic } from 'erxes-api-shared/utils';
import { json, type RequestHandler } from 'express';
import type { IncomingMessage } from 'http';

const sensitiveBodies = new WeakSet<object>();
const parseBody = json({
  limit: '15mb',
  verify(req: IncomingMessage & { rawBody?: Buffer }, _res, buffer) {
    if (containsCredentialTraffic(buffer.toString('utf8'))) {
      sensitiveBodies.add(req);
    } else {
      // Preserve the existing raw-body contract for ordinary GraphQL traffic.
      req.rawBody = buffer;
    }
  },
});

/** Run before the general raw-body parser and its error/telemetry handlers. */
export const credentialGraphqlBoundary: RequestHandler = (req, res, next) => {
  parseBody(req, res, (error: unknown) => {
    const sensitive =
      sensitiveBodies.has(req) ||
      containsCredentialTraffic(req.body) ||
      containsCredentialTraffic(req.query);
    if (!sensitive) return next(error);

    const request: IncomingMessage & { rawBody?: Buffer } = req;
    delete request.rawBody;
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    if (
      error ||
      req.method !== 'POST' ||
      !req.is('application/json') ||
      containsCredentialTraffic(req.query)
    ) {
      res.status(400).json({
        errors: [{ message: 'Credentials require a valid JSON POST request.' }],
      });
      return;
    }
    next();
  });
};

/** Also covers parse/validation/coercion errors before a resolver is called. */
export const credentialPrivacyPlugin: ApolloServerPlugin = {
  async requestDidStart({ request }) {
    let sensitive = containsCredentialTraffic(request.query);
    // Do not register vault documents (which may contain inline secrets) in
    // the persisted-query cache. Ordinary operations keep APQ support.
    if (sensitive && request.extensions)
      delete request.extensions.persistedQuery;

    return {
      async didResolveSource({ source }) {
        sensitive = sensitive || containsCredentialTraffic(source);
      },
      async willSendResponse({ response }) {
        if (!sensitive) return;
        response.http.headers.set('cache-control', 'no-store');
        response.http.headers.set('pragma', 'no-cache');
        if (
          response.body.kind === 'single' &&
          response.body.singleResult.errors
        ) {
          response.body.singleResult.errors = [
            {
              message:
                'Credential request failed. Check your inputs, access permissions and vault configuration.',
              extensions: { code: 'CREDENTIAL_REQUEST_FAILED' },
            },
          ];
        }
      },
    };
  },
};
