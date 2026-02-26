import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface IProductParams extends IListParams, ICursorPaginateParams {
  ids?: string[];
  excludeIds?: boolean;
  type?: string;
  status?: string;
  categoryIds?: string[];
  vendorId?: string;
  brandIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
  tagWithRelated?: boolean;
  sortField?: string;
  sortDirection?: number;
  pipelineId?: string;
  boardId?: string;
  segment?: string;
  segmentData?: string;
  groupedSimilarity?: string;
  image?: string;

  branchId: string;
  departmentId: string;
  minRemainder: number;
  maxRemainder: number;
  minPrice: number;
  maxPrice: number;
  minDiscountValue: number;
  maxDiscountValue: number;
  minDiscountPercent: number;
  maxDiscountPercent: number;
}
