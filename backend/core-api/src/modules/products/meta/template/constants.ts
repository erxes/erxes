import { IProductCategoryDocument, IProductDocument, IUomDocument } from 'erxes-api-shared/core-types';

export const PRODUCT_CATEGORY_TEMPLATE_OMIT_FIELDS: (keyof IProductCategoryDocument)[] = [
  '_id',
  'attachment',
  'createdAt',
];

export const PRODUCT_TEMPLATE_OMIT_FIELDS: (keyof IProductDocument)[] = [
  '_id',
  'attachment',
  'createdAt',
];

export const UOM_TEMPLATE_OMIT_FIELDS: (keyof IUomDocument)[] = [
  '_id',
  'createdAt',
];

export const PRODUCT_PIPELINE_STAGE = {
  $lookup: {
    from: 'products',
    let: { categoryIds: { $concatArrays: [['$_id'], '$descendants._id']}},
    pipeline: [
      {
        $match: {
          $expr: {
            $in: ['$categoryId', '$$categoryIds'],
          },
        },
      },
    ],
    as: 'products',
  },
};

export const PRODUCT_UOM_STAGE = {
  $lookup: {
    from: 'uoms',
    let: { uoms: '$products.uom' },
    pipeline: [
      {
        $match: {
          $expr: {
            $in: ['$code', '$$uoms'],
          },
        },
      },
    ],
    as: 'uoms',
  },
};
