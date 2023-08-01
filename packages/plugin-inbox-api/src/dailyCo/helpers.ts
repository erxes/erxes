import { debugError } from './debuggers';
import { Request, Response, NextFunction } from 'express';

export const routeErrorHandling = (fn: Function, callback?: any) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      await fn(req, res, next);
    } catch (e) {
      if (callback) {
        return callback(res, e, next);
      }
      debugError(e.message);
      return next(e);
    }
  };
};
