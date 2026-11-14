import {
  Request as ApiRequest,
  Response as ApiResponse,
  Application,
} from 'express';
import { logHandler } from './logs';
import { getSubdomain } from './utils';
import { extractUserFromHeader } from './headers';

enum API_METHODS {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

type TAPIMethod = keyof typeof API_METHODS;

export type TApiHandler = {
  method: TAPIMethod;
  path: string;
  resolver: (req: ApiRequest, res: ApiResponse) => Promise<void> | void;
};

export const initApiHandlers = (
  app: Application,
  apiHandlers: TApiHandler[],
) => {
  for (const handler of apiHandlers) {
    const { method, path, resolver } = handler;

    type LowercaseMethod = (typeof API_METHODS)[TAPIMethod];

    // Ensure `method` is one of the keys
    const METHOD = API_METHODS[method] as LowercaseMethod;
    type TApiMethodApp = Record<LowercaseMethod, Application[LowercaseMethod]>;

    (app as TApiMethodApp)[METHOD](
      path,
      async (req: ApiRequest, res: ApiResponse) => {
        return await logHandler(async () => await resolver(req, res), {
          subdomain: getSubdomain(req),
          source: 'webhook',
          action: method,
          payload: {
            path,
            headers: req.headers,
            body: req.body,
            query: req?.query,
          },
          userId: extractUserFromHeader(req.headers)?._id,
        });
      },
    );
  }
};
