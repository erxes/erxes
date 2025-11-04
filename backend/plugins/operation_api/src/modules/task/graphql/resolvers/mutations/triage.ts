import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ITriage } from '@/task/@types/triage';

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
    { input }: { input: ITriage },
    { models, user, subdomain }: IContext,
  ) => {
    return models.Triage.createTriage({
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
  },

  operationUpdateTriage: async (
    _parent: undefined,
    { _id, input }: { _id: string; input: ITriage },
    { models, user }: IContext,
  ) => {
    return models.Triage.updateTriage(_id, {
      name: input.name,
      description: input.description,
      teamId: input.teamId,
      createdBy: user._id,
      type: 'triage',
      number: 0,
      priority: input.priority || 0,
    });
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
};

requireLogin(triageMutations, 'operationAddTriage');
requireLogin(triageMutations, 'operationUpdateTriage');
requireLogin(triageMutations, 'operationConvertTriageToTask');
