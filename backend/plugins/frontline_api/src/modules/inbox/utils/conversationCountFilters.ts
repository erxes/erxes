import { fixDate } from 'erxes-api-shared/utils';
export const buildUserRelevanceQueries = (code?: string) => {
  const userRelevanceQuery = [
    {
      regexp: {
        userRelevance: `${code}..`,
      },
    },
    {
      bool: {
        must_not: [
          {
            exists: {
              field: 'userRelevance',
            },
          },
        ],
      },
    },
  ];

  return [{ bool: { should: userRelevanceQuery } }];
};
export const buildParticipatingQuery = (userId: string) => {
  return {
    bool: {
      should: [
        {
          match: {
            participatedUserIds: userId,
          },
        },
        {
          match: {
            assignedUserId: userId,
          },
        },
      ],
    },
  };
};
export const buildDateQueries = (startDate: string, endDate: string) => {
  return [
    {
      range: {
        createdAt: {
          gte: fixDate(startDate),
          lte: fixDate(endDate),
        },
      },
    },
    {
      range: {
        updatedAt: {
          gte: fixDate(startDate),
          lte: fixDate(endDate),
        },
      },
    },
  ];
};
