import { ActivityLogInput, Resolver } from 'erxes-api-shared/core-modules';
import { ICustomerDocument, ITag, IUser } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { CUSTOMER_PRONOUN_LABELS } from './constants';
import {
  buildCustomerFieldChangedActivity,
  buildCustomerTagActivities,
} from './builders';

type CustomerActivityContext = {
  customer: ICustomerDocument;
  models: IModels;
};

export const customerActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, ctx: CustomerActivityContext) => {
    if (!field) {
      return [];
    }

    return [
      buildCustomerFieldChangedActivity({
        customer: ctx.customer,
        field,
        prev,
        current,
      }),
    ];
  },

  sex: ({ field, prev, current }, ctx: CustomerActivityContext) => [
    buildCustomerFieldChangedActivity({
      customer: ctx.customer,
      field,
      prev,
      current,
      fieldLabel: 'Pronoun',
      previousValueLabel:
        prev === null || prev === undefined || prev === ''
          ? 'empty'
          : CUSTOMER_PRONOUN_LABELS[String(prev)] || String(prev),
      currentValueLabel:
        current === null || current === undefined || current === ''
          ? 'empty'
          : CUSTOMER_PRONOUN_LABELS[String(current)] || String(current),
    }),
  ],

  ownerId: async ({ field, prev, current }, ctx: CustomerActivityContext) => {
    const ids = [prev, current].filter(Boolean);
    const users = ids.length
      ? await ctx.models.Users.find(
          { _id: { $in: ids } },
          {
            email: 1,
            'details.fullName': 1,
          },
        ).lean()
      : [];

    const labelById = new Map(
      users.map((user: { _id: string } & IUser) => [
        String(user._id),
        user?.details?.fullName || user?.email || 'unknown',
      ]),
    );

    return [
      buildCustomerFieldChangedActivity({
        customer: ctx.customer,
        field,
        prev,
        current,
        fieldLabel: 'Owner',
        previousValueLabel: prev
          ? labelById.get(String(prev)) || 'unknown'
          : 'empty',
        currentValueLabel: current
          ? labelById.get(String(current)) || 'unknown'
          : 'empty',
      }),
    ];
  },

  tagIds: async (
    { added = [], removed = [] },
    ctx: CustomerActivityContext,
  ) => {
    const [addedTags, removedTags] = await Promise.all([
      added.length
        ? ctx.models.Tags.find({ _id: { $in: added } }, { name: 1 }).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Tags.find({ _id: { $in: removed } }, { name: 1 }).lean()
        : Promise.resolve([]),
    ]);

    return buildCustomerTagActivities({
      customer: ctx.customer,
      added,
      removed,
      addedLabels: addedTags.map((tag: ITag) => tag.name),
      removedLabels: removedTags.map((tag: ITag) => tag.name),
    });
  },
};
