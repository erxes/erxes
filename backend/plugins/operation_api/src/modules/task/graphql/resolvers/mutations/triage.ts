import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
<<<<<<< HEAD
import { ITriage } from '@/task/@types/triage';
=======
import { ITriageInput } from '@/task/@types/triage';
>>>>>>> ac96c6c937 (add triage)

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
<<<<<<< HEAD
    { input }: { input: ITriage },
=======
    params: ITriageInput,
>>>>>>> ac96c6c937 (add triage)
    { models, user, subdomain }: IContext,
  ) => {
    const triage = await models.Triage.createTriage({
      triage: {
<<<<<<< HEAD
        name: input.name,
        description: input.description,
        teamId: input.teamId,
        createdBy: user._id,
        type: 'triage',
        number: 0,
        priority: input.priority || 0,
=======
        name: params.name,
        description: params.description,
        teamId: params.teamId,
        createdBy: user._id,
        type: 'triage',
        number: 0,
>>>>>>> ac96c6c937 (add triage)
      },
      subdomain: subdomain,
    });

    return triage;
  },
<<<<<<< HEAD

  operationUpdateTriage: async (
    _parent: undefined,
    { _id, input }: { _id: string; input: ITriage },
    { models, user }: IContext,
  ) => {
    const triage = await models.Triage.updateTriage(_id, {
      name: input.name,
      description: input.description,
      teamId: input.teamId,
      createdBy: user._id,
      type: 'triage',
      number: 0,
      priority: input.priority || 0,
    });

    return triage;
  },

  operationConvertTriageToTask: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext,
  ) => {
    const triage = await models.Triage.getTriage(_id);
    if (!triage) {
      throw new Error('Triage not found');
    }

    const task = await models.Task.createTask({
      doc: {
        name: triage.name,
        description: triage.description,
        teamId: triage.teamId,
        priority: triage.priority || 0,
        triageId: _id,
      },
      userId: user._id,
      subdomain: subdomain,
    });

    if (task) {
      await models.Triage.deleteTriage(_id);
      return task;
    } else {
      throw new Error('Failed to convert triage to task');
    }
  },
=======
>>>>>>> ac96c6c937 (add triage)
};

requireLogin(triageMutations, 'operationAddTriage');
requireLogin(triageMutations, 'operationUpdateTriage');
<<<<<<< HEAD
requireLogin(triageMutations, 'operationConvertTriageToTask');
=======
requireLogin(triageMutations, 'operationCancelTriage');
>>>>>>> ac96c6c937 (add triage)
