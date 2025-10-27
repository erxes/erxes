import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ITriageInput } from '@/task/@types/triage';

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
    params: ITriageInput,
    { models, user, subdomain }: IContext,
  ) => {
    const triage = await models.Triage.createTriage({
      triage: {
        name: params.name,
        description: params.description,
        teamId: params.teamId,
        createdBy: user._id,
        type: 'triage',
        number: 0,
      },
      subdomain: subdomain,
    });

    return triage;
  },
};

requireLogin(triageMutations, 'operationAddTriage');
requireLogin(triageMutations, 'operationUpdateTriage');
requireLogin(triageMutations, 'operationCancelTriage');
