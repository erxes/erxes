import { GraphQLResolveInfo } from 'graphql';
import { SortOrder } from 'mongoose';
import { IUserDocument } from './modules/team-member/user';
import { Request as ApiRequest } from 'express';
import { ScopedEventHandlers } from '../core-modules';

export interface IRule {
  kind: string;
  text: string;
  condition: string;
  value: string;
}

export interface ILink {
  [key: string]: string;
}

export interface IRuleDocument extends IRule, Document {
  _id: string;
}

export interface IOffsetPaginateParams {
  limit?: number;
  page?: number;
  perPage?: number;

  sortField?: string;
  sortDirection?: SortOrder;
}

export interface ICursorPaginateParams {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  cursorMode?: 'inclusive' | 'exclusive';
  orderBy?: Record<string, SortOrder>;
}

export interface ICursorPaginateResult<T> {
  list: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface IListParams extends ICursorPaginateParams {
  searchValue?: string;
  sortField?: string;
}

export interface IStringMap {
  [key: string]: string;
}

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
  locationValue?: ILocationOption;
  extraValue?: string;
}

export interface IPropertyField {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | Array<string | number | boolean | Date>
    | null;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  countryCode?: string;
}

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface IPdfAttachment {
  pdf?: IAttachment;
  pages: IAttachment[];
}

export interface IMainContext {
  res: any;
  req: ApiRequest;
  requestInfo: any;
  user: IUserDocument;
  cpUser?: any;
  clientPortal?: any;
  models?: any;
  __: <T extends object>(doc: T) => T & { processId: string };
  processId: string;
  eventHandlers: ScopedEventHandlers;
  checkPermission: (action: string, ownerId?: string) => Promise<void>;
}

export interface IOrderInput {
  _id: string;
  order: number;
}

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IResolverSymbol {
  wrapperConfig?: {
    skipPermission?: boolean;
    forClientPortal?: boolean;
    cpUserRequired?: boolean;
  };
}

export type Resolver<
  Parent = any,
  Args = any,
  Context = { subdomain: string } & IMainContext,
  Result = any,
> = {
  resolve(
    parent: Parent,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo,
  ): Promise<Result> | Result;
}['resolve'] &
  Partial<IResolverSymbol>;

export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
}

/**
 * Where a record came from, when nobody typed it in.
 *
 * `createdBy` answers who owns a record; this answers what produced it — a
 * campaign, an automation, an import. The two are not the same claim: a task
 * opened by a campaign belongs to the person whose campaign it was, but they
 * never pressed create, and only this says so.
 */
export type TCreatedVia = {
  /** What kind of thing produced it: `broadcast`, `automation`, `import`, … */
  source: string;
  /** The configuration that produced it — a campaign, an automation. */
  sourceId: string;
  /**
   * What that configuration was called at the time. Kept rather than looked
   * up: a record explains itself without a join, and renaming the campaign
   * later must not rewrite what already happened.
   */
  sourceName?: string;
  /** The single run of that configuration, when there is one to point at. */
  runId?: string;
  /** Whose configuration it was. Absent when nobody asked — an event did. */
  actorId?: string;
};
