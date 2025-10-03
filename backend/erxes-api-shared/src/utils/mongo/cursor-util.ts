import { SortOrder, FilterQuery, Model, Types, PipelineStage } from 'mongoose';

export interface CursorPaginateParams<T> {
  model: Model<T>;
  params: {
    limit?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: Record<string, SortOrder>;
  };
  query?: FilterQuery<T>;
}

export interface CursorPaginateParamsWithAggregation<T> {
  model: Model<T>;
  pipeline: PipelineStage[];
  params: {
    limit?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: Record<string, SortOrder>;
  };
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface CursorResult<T> {
  list: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

export const encodeCursor = (item: any, sortFields: string[]): string => {
  const cursorData: any = {};

  for (const field of sortFields) {
    if (item[field] !== undefined) {
      cursorData[field] = item[field];
    }
  }

  // Handle ObjectId serialization
  cursorData._id =
    item._id instanceof Types.ObjectId ? item._id.toString() : item._id;

  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
};

export const decodeCursor = (cursor: string): any => {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());

    // Convert _id back to ObjectId if it's a valid ObjectId string
    if (decoded._id && Types.ObjectId.isValid(decoded._id)) {
      decoded._id = new Types.ObjectId(decoded._id);
    }

    return decoded;
  } catch {
    throw new Error('Invalid cursor format');
  }
};

export const buildCursorQuery = (
  cursor: string,
  orderBy: Record<string, SortOrder>,
  direction: 'forward' | 'backward',
): Record<string, any> => {
  const cursorData = decodeCursor(cursor);
  const sortFields = Object.keys(orderBy);

  if (sortFields.length === 0) {
    const operator = direction === 'forward' ? '$gt' : '$lt';
    return { _id: { [operator]: cursorData._id } };
  }

  const orConditions: Record<string, any>[] = [];

  for (let i = 0; i < sortFields.length; i++) {
    const field = sortFields[i];
    const sortOrder = orderBy[field];
    const isAscending = sortOrder === 1 || sortOrder === 'asc';

    const condition: Record<string, any> = {};

    for (let j = 0; j < i; j++) {
      const prevField = sortFields[j];
      condition[prevField] = cursorData[prevField];
    }

    const operator =
      direction === 'forward'
        ? isAscending
          ? '$gt'
          : '$lt'
        : isAscending
        ? '$lt'
        : '$gt';

    if (cursorData[field] !== undefined) {
      condition[field] = { [operator]: cursorData[field] };
      orConditions.push(condition);
    }
  }

  const finalCondition: Record<string, any> = {};
  for (const field of sortFields) {
    if (cursorData[field] !== undefined) {
      finalCondition[field] = cursorData[field];
    }
  }

  const idOperator = direction === 'forward' ? '$gt' : '$lt';
  finalCondition._id = { [idOperator]: cursorData._id };
  orConditions.push(finalCondition);

  return orConditions.length > 0 ? { $or: orConditions } : {};
};
