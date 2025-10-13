import { GraphQLResolveInfo } from 'graphql';
import { SortOrder } from 'mongoose';
import { IUserDocument } from './modules/team-member/user';

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
  extraValue?: string;
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
  req: any;
  requestInfo: any;
  user: IUserDocument;
  models?: any;
  __: <T extends object>(doc: T) => T & { processId: string };
  processId: string;
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
  skipPermission?: boolean;
}

export type Resolver<
  Parent = any,
  Args = any,
  Context = { subdomain: string } & IMainContext,
  Result = any,
> = ((
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => Promise<Result> | Result) &
  IResolverSymbol;