import mongoose, { Schema, Document, FilterQuery } from 'mongoose';
import { nanoid } from 'nanoid';

import { mongooseStringRandomId } from './mongoose-types';
import {
  CursorPaginateParams,
  CursorResult,
  encodeCursor,
  buildCursorQuery,
  PageInfo,
} from './cursor-util';

export interface IOrderInput {
  _id: string;
  order: number;
}

export const mongooseField = (options: any) => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  if (pkey) {
    options.type = String;
    options.default = () => nanoid();
  }

  return options;
};

export const updateMongoDocumentOrder = async (
  collection: any,
  orders: IOrderInput[],
) => {
  if (orders.length === 0) {
    return [];
  }

  const ids: string[] = [];
  const bulkOps: Array<{
    updateOne: {
      query: { _id: string };
      update: { order: number };
    };
  }> = [];

  for (const { _id, order } of orders) {
    ids.push(_id);

    const selector: { order: number } = { order };

    bulkOps.push({
      updateOne: {
        query: { _id },
        update: selector,
      },
    });
  }

  await collection.bulkWrite(bulkOps);

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

export const defaultPaginate = (
  collection: mongoose.Query<any, any>,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  },
) => {
  const { page = 1, perPage = 20, ids, excludeIds } = params || { ids: null };

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

export const cursorPaginate = async <T extends Document>({
  model,
  params,
  query,
}: CursorPaginateParams<T>): Promise<CursorResult<T>> => {
  const { limit = 20, cursor, direction = 'forward', orderBy = {} } = params;

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const baseQuery = { ...query };

  if (cursor) {
    const cursorQuery = buildCursorQuery(cursor, orderBy, direction);
    Object.assign(baseQuery, cursorQuery);
  }

  const sortFields = Object.keys(orderBy);
  const sortOrder: Record<string, 1 | -1> = {};

  for (const [field, order] of Object.entries(orderBy)) {
    const normalizedOrder = order === 1 || order === 'asc' ? 1 : -1;
    sortOrder[field] =
      direction === 'forward'
        ? normalizedOrder
        : normalizedOrder === 1
        ? -1
        : 1;
  }

  sortOrder._id = (direction === 'forward' ? 1 : -1) as 1 | -1;

  const [items, totalCount] = await Promise.all([
    model
      .find(baseQuery as FilterQuery<T>)
      .sort(sortOrder)
      .limit(limit + 1)
      .lean(),
    model.countDocuments(query as FilterQuery<T>),
  ]);

  const hasMore = items.length > limit;
  let list = hasMore ? items.slice(0, limit) : items;

  if (direction === 'backward') {
    list = list.reverse();
  }

  const startCursor =
    list.length > 0 ? encodeCursor(list[0], sortFields) : null;
  const endCursor =
    list.length > 0 ? encodeCursor(list[list.length - 1], sortFields) : null;

  const pageInfo: PageInfo = {
    hasNextPage: direction === 'forward' ? hasMore : Boolean(cursor),
    hasPreviousPage: direction === 'backward' ? hasMore : Boolean(cursor),
    startCursor,
    endCursor,
  };

  return {
    list: list as T[],
    totalCount,
    pageInfo,
  };
};

export const checkCollectionCodeDuplication = async (
  collection: any,
  code: string,
) => {
  if (code.includes('/')) {
    throw new Error('The "/" character is not allowed in the code');
  }

  const category = await collection.findOne({
    code,
  });

  if (category) {
    throw new Error('Code must be unique');
  }
};

export const schemaWrapper = (
  schema: Schema,
  options?: { contentType?: string },
) => {
  schema.add({ _id: mongooseStringRandomId });
  schema.add({ processId: { type: String, optional: true } });
  // schema.add({ createdAt: { type: Date, default: new Date() } });

  if (options?.contentType) {
    (schema.statics as any)._contentType = options.contentType;
  }

  return schema;
};
