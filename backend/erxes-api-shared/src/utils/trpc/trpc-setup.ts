import { Application } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
// import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createTRPCContext, TRPCContext } from './utils';
// import {
//   createTRPCSecurityMiddleware,
//   createTRPCSecurityLoggingMiddleware,
//   defaultTRPCSecurityConfig,
//   TRPCSecurityConfig,
// } from './trpc-middleware';

export interface TRPCSetupOptions {
  router: any;
  createContext: <TContext>(
    subdomain: string,
    context: any,
  ) => Promise<TContext & TRPCContext>;
  // securityConfig?: TRPCSecurityConfig;
  rateLimitConfig?: {
    windowMs?: number;
    max?: number;
  };
  helmetConfig?: Record<string, any>;
}

export function setupTRPCRoute(app: Application, options: TRPCSetupOptions) {
  const {
    router,
    createContext,
    // securityConfig = defaultTRPCSecurityConfig,
    rateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    },
    helmetConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    },
  } = options;

  // app.use(createTRPCSecurityLoggingMiddleware());

  // // // Raw body parsing middleware for signature verification
  // app.use('/trpc', (req, res, next) => {
  //   if (req.method === 'POST') {
  //     let data = '';
  //     req.setEncoding('utf8');
  //     req.on('data', (chunk) => {
  //       data += chunk;
  //     });
  //     req.on('end', () => {
  //       (req as any).rawBody = data;
  //       next();
  //     });
  //   } else {
  //     next();
  //   }
  // });

  // const trpcRateLimit = rateLimit({
  //   windowMs: rateLimitConfig.windowMs,
  //   max: rateLimitConfig.max,
  //   message: {
  //     error: 'Too Many Requests',
  //     message: 'Rate limit exceeded. Please try again later.',
  //   },
  //   standardHeaders: true,
  //   legacyHeaders: false,
  // });

  const trpcHelmet = helmet(helmetConfig);

  app.use(
    '/trpc',
    trpcHelmet,
    // trpcRateLimit,
    // createTRPCSecurityMiddleware(securityConfig),
    trpcExpress.createExpressMiddleware({
      router,
      createContext: createTRPCContext(createContext),
    }),
  );
}
