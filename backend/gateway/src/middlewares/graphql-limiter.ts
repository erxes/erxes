import * as dotenv from 'dotenv';

import {
  DocumentNode,
  execute,
  parse,
  subscribe,
  validate,
  specifiedRules,
} from 'graphql';
import { envelop, useSchema, useEngine } from '@envelop/core';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { Express, json } from 'express';
import * as fs from 'fs';
import { supergraphPath } from '~/apollo-router/paths';
import { gql } from '@apollo/client/core';
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases';
import { characterLimitPlugin } from '@escape.tech/graphql-armor-character-limit';
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth';

dotenv.config();

const { GRAPHQL_LIMITER } = process.env;
const DEBUG_GATEWAY_AUTH = process.env.DEBUG_GATEWAY_AUTH === 'true';

const debugLimiter = (
  req: any,
  event: string,
  extra: Record<string, unknown> = {},
) => {
  if (!DEBUG_GATEWAY_AUTH) {
    return;
  }

  console.log(
    JSON.stringify({
      scope: 'gateway-graphql-limiter',
      event,
      method: req.method,
      path: req.originalUrl,
      hasUser: Boolean(req.user?._id),
      userId: req.user?._id || '',
      ...extra,
    }),
  );
};

export async function applyGraphqlLimiters(app: Express) {
  if (!GRAPHQL_LIMITER) {
    return;
  }
  const supergraph = fs.readFileSync(supergraphPath).toString();

  const supergraphTypeDefs = gql(supergraph);

  const eschema = makeExecutableSchema({
    typeDefs: [
      ...((supergraphTypeDefs && [supergraphTypeDefs]) as DocumentNode[]),
    ],
  });

  const getEnveloped = envelop({
    plugins: [
      useEngine({
        parse,
        validate,
        specifiedRules,
        execute,
        subscribe,
      }),
      useSchema(eschema),
      characterLimitPlugin({
        maxLength: 10_000,
      }),

      maxAliasesPlugin({
        n: 0,
      }),
      maxDepthPlugin({
        n: 50,
        ignoreIntrospection: true,
      }),
    ],
  });

  app.use(
    '/graphql',
    (req, res, next) => {
      const startedAt = Date.now();
      debugLimiter(req, 'enter');

      res.once('finish', () => {
        debugLimiter(req, 'finish', {
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        });
      });

      res.once('close', () => {
        debugLimiter(req, 'close', {
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        });
      });

      next();
    },
    json(),
    async (req, res, next) => {
    if (req.body.query) {
      const { parse, validate, schema } = getEnveloped({
        req,
      });

      try {
        const document = parse(req.body.query);
        const validationErrors = validate(schema, document);
        if (validationErrors?.length) {
          debugLimiter(req, 'validation-error', {
            errorCount: validationErrors.length,
          });
          return res.status(400).json({ errors: validationErrors });
        }
        debugLimiter(req, 'validated');
      } catch (e) {
        debugLimiter(req, 'parse-or-validation-error', {
          error: e instanceof Error ? e.message : 'unknown',
        });
        return res.status(400).json({ errors: [e] });
      }
    } else {
      debugLimiter(req, 'no-query');
    }

    next();
    },
  );
}
