import { useServer } from 'graphql-ws/lib/use/ws';
import {
  DocumentNode,
  execute,
  ExecutionArgs,
  getOperationAST,
  GraphQLError,
  parse,
  subscribe,
  validate,
} from 'graphql';
import * as ws from 'ws';
import SubscriptionResolver from './SubscriptionResolver';
import { Disposable, SubscribeMessage } from 'graphql-ws';
import genTypeDefsAndResolvers from './genTypeDefsAndResolvers';
import * as http from 'http';
import { supergraphPath } from '../apollo-router/paths';
import * as fs from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { apolloRouterPort } from '../apollo-router';
import { gql } from '@apollo/client/core';
import { getSubdomain } from '../util/subdomain';
import * as jwt from 'jsonwebtoken';
import { createHmac } from 'crypto';
import { redis } from 'erxes-api-shared/utils';
import { generateModels } from '../connectionResolver';
import {
  SECURE_SESSION_COOKIE,
  SESSION_COOKIE,
  verifySession,
} from '../util/session';

let disposable: Disposable | undefined;

function readCookie(rawCookie: string | undefined, name: string) {
  if (!rawCookie) {
    return undefined;
  }
  for (const part of rawCookie.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) {
      continue;
    }
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

// Same checks as the HTTP middleware: live session or still-valid legacy token, active user
async function extractSubscriptionUser(request: any, subdomain: string) {
  try {
    const rawCookie = request?.headers?.cookie;
    const sid =
      readCookie(rawCookie, SECURE_SESSION_COOKIE) ||
      readCookie(rawCookie, SESSION_COOKIE);

    let userId = '';

    if (sid) {
      userId = (await verifySession(subdomain, sid))?.userId || '';
    }

    const token = readCookie(rawCookie, 'auth-token');

    if (!userId && token) {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_TOKEN_SECRET || 'SECRET',
      );
      const legacyUserId = decoded?.user?._id;

      if (
        legacyUserId &&
        (await redis.get(`user_token_${legacyUserId}_${token}`))
      ) {
        userId = legacyUserId;
      }
    }

    if (!userId) {
      return undefined;
    }

    const models = await generateModels(subdomain);

    return (
      (await models.Users.findOne(
        { _id: userId, isActive: { $ne: false } },
        { _id: 1, isOwner: 1 },
      ).lean()) || undefined
    );
  } catch {
    return undefined;
  }
}

// Mirrors frontline's widget session: same derived secret and audience, so a
// staff token can never pass as a widget one.
const WIDGET_AUDIENCE = 'erxes-widget';

type WidgetSession = {
  integrationId: string;
  customerId?: string;
  visitorId?: string;
};

function extractWidgetSession(
  connectionParams?: Readonly<Record<string, unknown>>,
): WidgetSession | undefined {
  const token = connectionParams?.widgetToken;

  if (typeof token !== 'string' || !token) {
    return undefined;
  }

  try {
    const secret = createHmac(
      'sha256',
      process.env.JWT_TOKEN_SECRET || 'SECRET',
    )
      .update(WIDGET_AUDIENCE)
      .digest('hex');
    const { integrationId, customerId, visitorId } = jwt.verify(token, secret, {
      audience: WIDGET_AUDIENCE,
    }) as Partial<WidgetSession>;

    if (typeof integrationId !== 'string' || !(customerId || visitorId)) {
      return undefined;
    }

    return { integrationId, customerId, visitorId };
  } catch {
    return undefined;
  }
}

export async function stopSubscriptionServer() {
  if (disposable) {
    try {
      await disposable.dispose();
    } catch (e) {
      console.error(e);
    }
  }
}

export function makeSubscriptionSchema({ typeDefs, resolvers }: any) {
  if (!typeDefs || !resolvers) {
    throw new Error(
      'Both `typeDefs` and `resolvers` are required to make the executable subscriptions schema.',
    );
  }
  const supergraph = fs.readFileSync(supergraphPath).toString();

  const supergraphTypeDefs = gql(supergraph);

  return makeExecutableSchema({
    typeDefs: [
      ...((supergraphTypeDefs && [supergraphTypeDefs]) as DocumentNode[]),
      typeDefs,
    ],
    resolvers,
  });
}

export async function startSubscriptionServer(httpServer: http.Server) {
  const wsServer = new ws.Server({
    server: httpServer,
    path: '/graphql',
  });

  const typeDefsResolvers = await genTypeDefsAndResolvers();

  if (!typeDefsResolvers) {
    return;
  }

  const { typeDefs, resolvers } = typeDefsResolvers;

  const schema = makeSubscriptionSchema({
    typeDefs,
    resolvers,
  });

  await stopSubscriptionServer();

  disposable = useServer(
    {
      execute,
      subscribe,
      context: async (ctx, _msg: SubscribeMessage, _args: ExecutionArgs) => {
        const gatewayDataSource = new SubscriptionResolver(
          `http://127.0.0.1:${apolloRouterPort}`,
          ctx,
        );
        const subdomain = getSubdomain(ctx.extra.request);
        const user = await extractSubscriptionUser(
          ctx.extra.request,
          subdomain,
        );
        const widgetSession = extractWidgetSession(ctx.connectionParams);
        return {
          dataSources: { gatewayDataSource },
          subdomain,
          user,
          widgetSession,
        };
      },
      onSubscribe: async (
        _ctx,
        msg: SubscribeMessage,
      ): Promise<ExecutionArgs | readonly GraphQLError[] | void> => {
        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
        };

        const operationAST = getOperationAST(args.document, args.operationName);

        // Stops the subscription and sends an error message
        if (!operationAST) {
          return [new GraphQLError('Unable to identify operation')];
        }

        // Handle mutation and query requests
        if (operationAST.operation !== 'subscription') {
          return [
            new GraphQLError('Only subscription operations are supported'),
          ];
        }

        // Validate the operation document
        const errors = validate(args.schema, args.document);

        if (errors.length > 0) {
          return errors;
        }
        // Ready execution arguments
        return args;
      },
    },
    wsServer,
  );
}
