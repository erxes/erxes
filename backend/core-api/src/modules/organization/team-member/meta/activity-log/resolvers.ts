import { ActivityLogInput, Resolver } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  buildUserActivatedActivity,
  buildUserDeactivatedActivity,
  buildUserFieldChangedActivity,
  buildUserRoleChangedActivity,
} from './builders';

type UserActivityContext = {
  target: IUserDocument;
};

export const userActivityResolvers: Record<
  string,
  Resolver<ActivityLogInput>
> = {
  $default: ({ field, prev, current }, { target }: UserActivityContext) => {
    if (field == null) {
      return [];
    }

    return [
      buildUserFieldChangedActivity({
        user: target,
        field,
        prev,
        current,
      }),
    ];
  },

  isActive: ({ current }, { target }: UserActivityContext) =>
    current
      ? [buildUserActivatedActivity(target)]
      : [buildUserDeactivatedActivity(target)],

  role: ({ prev, current }, { target }: UserActivityContext) => [
    buildUserRoleChangedActivity({
      user: target,
      prevRole: prev,
      currentRole: current,
    }),
  ],
};
