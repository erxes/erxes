import { collection, type Context } from 'erxes-sdk/server';
import type { INote } from './db/definitions/notes';

// Each collection is ext.<id>.<Name> in the tenant's database.
export const collections = { Notes: collection<INote>() };

// What every resolver gets: ctx.db typed by the collections above.
export type IContext = Context<typeof collections>;
