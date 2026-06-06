import { ActivityLogInput, Resolver } from 'erxes-api-shared/core-modules';
import { IProductDocument, ITag } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  buildProductDescriptionChangedActivity,
  buildProductFieldChangedActivity,
  buildProductTagActivities,
} from './builders';

type ProductActivityContext = {
  product: IProductDocument;
  models: IModels;
};

export const productActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, ctx: ProductActivityContext) => {
    if (!field) {
      return [];
    }

    return [
      buildProductFieldChangedActivity({
        product: ctx.product,
        field,
        prev,
        current,
      }),
    ];
  },

  description: ({ prev, current }, ctx: ProductActivityContext) => [
    buildProductDescriptionChangedActivity({
      product: ctx.product,
      prev,
      current,
    }),
  ],

  tagIds: async ({ added = [], removed = [] }, ctx: ProductActivityContext) => {
    const [addedTags, removedTags] = await Promise.all([
      added.length
        ? ctx.models.Tags.find({ _id: { $in: added } }, { name: 1 }).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Tags.find({ _id: { $in: removed } }, { name: 1 }).lean()
        : Promise.resolve([]),
    ]);

    return buildProductTagActivities({
      product: ctx.product,
      added,
      removed,
      addedLabels: addedTags.map((tag: ITag) => tag.name),
      removedLabels: removedTags.map((tag: ITag) => tag.name),
    });
  },
};
