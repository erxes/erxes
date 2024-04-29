import * as dotenv from 'dotenv';
dotenv.config();
import {
  DocumentNode,
  execute,
  ExecutionArgs,
  getOperationAST,
  GraphQLError,
  parse,
  subscribe,
  validate,
  specifiedRules,
} from 'graphql';
import {
  envelop,
  useLogger,
  useSchema,
  useEnvelop,
  useEngine,
} from '@envelop/core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Express, json, raw, Request } from 'express';
import * as fs from 'fs';
import { supergraphPath } from '../apollo-router/paths';
import { gql } from '@apollo/client/core';
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases';
import { characterLimitPlugin } from '@escape.tech/graphql-armor-character-limit';
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth';

const { GRAPHQL_LIMITER } = process.env;

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
      // @ts-ignore allowList isn't supposed to required, but the @escape.tech/graphql-armor-max-aliases library has wrong type
      maxAliasesPlugin({
        n: 0,
      }),
      maxDepthPlugin({
        n: 50,
        ignoreIntrospection: true,
      }),
    ],
  });

  app.use('/graphql', json(), async (req, res, next) => {
    if (req.body.query) {
      const { parse, validate, contextFactory, execute, schema } = getEnveloped(
        {
          req,
        },
      );

      try {
        const document = parse(req.body.query);
        const validationErrors = validate(schema, document);
        if (validationErrors?.length) {
          return res.status(400).json({ errors: validationErrors });
        }
      } catch (e) {
        return res.status(400).json({ errors: [e] });
      }
    }

    next();
  });
}
