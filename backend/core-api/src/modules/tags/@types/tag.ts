import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ITagFilterQueryParams
  extends IListParams,
    ICursorPaginateParams {
  type: string;
  tagIds?: string[];
  parentId?: string;
  isGroup?: boolean;
  ids: string[];
  excludeIds: boolean;
}
