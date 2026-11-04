import { collection, type Context } from 'erxes-sdk/server';
import type { IResponseTemplate } from './db/definitions/responseTemplates';

// The extension's own collections, `ctx.db.<Name>` in every resolver.
export const collections = {
  ResponseTemplates: collection<IResponseTemplate>(),
};

export type IContext = Context<typeof collections>;
