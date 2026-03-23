import { ActivityLogInput, Resolver } from 'erxes-api-shared/core-modules';
import { ICompanyDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  buildCompanyFieldChangedActivity,
  buildCompanyTagActivities,
} from './builders';

type CompanyActivityContext = {
  company: ICompanyDocument;
  models: IModels;
};

export const companyActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, ctx: CompanyActivityContext) => {
    if (!field) {
      return [];
    }

    return [
      buildCompanyFieldChangedActivity({
        company: ctx.company,
        field,
        prev,
        current,
      }),
    ];
  },

  tagIds: async ({ added = [], removed = [] }, ctx: CompanyActivityContext) => {
    const [addedTags, removedTags] = await Promise.all([
      added.length
        ? ctx.models.Tags.find({ _id: { $in: added } }, { name: 1 }).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Tags.find({ _id: { $in: removed } }, { name: 1 }).lean()
        : Promise.resolve([]),
    ]);

    return buildCompanyTagActivities({
      company: ctx.company,
      added,
      removed,
      addedLabels: addedTags.map((tag: any) => tag.name),
      removedLabels: removedTags.map((tag: any) => tag.name),
    });
  },
};
