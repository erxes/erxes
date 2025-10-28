import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ITriageInput } from '@/task/@types/triage';

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
    { input }: { input: ITriageInput },
    { models, user, subdomain }: IContext,
  ) => {
    const triage = await models.Triage.createTriage({
      triage: {
        name: input.name,
        description: input.description,
        teamId: input.teamId,
        createdBy: user._id,
        type: 'triage',
        number: 0,
        priority: input.priority || 0,
      },
      subdomain: subdomain,
    });

    return triage;
  },
};

requireLogin(triageMutations, 'operationAddTriage');
requireLogin(triageMutations, 'operationUpdateTriage');
requireLogin(triageMutations, 'operationCancelTriage');
