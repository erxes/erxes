import DataLoader from 'dataloader';
import {
  checkPermissionGroup,
  IDataExtensionRecord,
} from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { GraphQLError } from 'graphql';
import { LIMITS } from '~/modules/data-extensions/runtime/limits';

export interface IRequestContext {
  subdomain: string;
  user: IUserDocument;
  /** Throws unless the caller holds the action; memoised per request. */
  requirePermission(action: string): Promise<void>;
  /** Request-scoped loaders, one per record type. Never shared. */
  loaders: Map<string, DataLoader<string, IDataExtensionRecord | null>>;
  /** Request-scoped reverse-relation loaders, one per relation and page size. */
  relationLoaders: Map<string, DataLoader<string, IDataExtensionRecord[]>>;
  /**
   * Counts records resolved by this request and throws once the budget is
   * spent, so nested relation lists cannot multiply without bound.
   */
  consumeRecords(count: number): void;
}

export const createRequestContext = (
  subdomain: string,
  user: IUserDocument,
): IRequestContext => {
  const check = checkPermissionGroup(subdomain, user);
  const checks = new Map<string, Promise<void>>();
  let resolvedRecords = 0;

  return {
    subdomain,
    user,
    loaders: new Map(),
    relationLoaders: new Map(),
    consumeRecords(count: number) {
      resolvedRecords += count;

      if (resolvedRecords > LIMITS.records) {
        throw new GraphQLError(
          `This query resolves more than ${LIMITS.records} records; ask for fewer`,
          { extensions: { code: 'QUERY_TOO_LARGE' } },
        );
      }
    },
    requirePermission(action: string) {
      let pending = checks.get(action);

      if (!pending) {
        pending = check(action);
        checks.set(action, pending);
      }

      return pending;
    },
  };
};
