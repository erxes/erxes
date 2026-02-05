import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ITriageAddInput, ITriageUpdateInput } from '@/task/@types/triage';
import { STATUS_TYPES } from '@/status/constants/types';

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
    { input }: { input: ITriageAddInput },
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
        status: input.status || STATUS_TYPES.TRIAGE,
      },
      subdomain: subdomain,
    });
  },

  operationUpdateTriage: async (
    _parent: undefined,
    { _id, input }: { _id: string; input: ITriageUpdateInput },
    { models, user }: IContext,
  ) => {
    return models.Triage.updateTriage(_id, input);
  },

  operationConvertTriageToTask: async (
    _parent: undefined,
    { _id, status, reason }: { _id: string; status?: number; reason?: string },
    { models, user, subdomain }: IContext,
  ) => {
    const triage = await models.Triage.getTriage(_id);
    if (!triage) {
      throw new Error('Triage not found');
    }

    let statusId : string | undefined = undefined;

    if (typeof status === 'number') {
      const statusDoc = await models.Status.findOne({
        teamId: triage.teamId,
        type: status,
      });

      if (!statusDoc) {
        throw new Error('Status not found');
      }
      statusId = statusDoc._id;
    }

    const task = await models.Task.createTask({
      doc: {
        name: triage.name,
        description: triage.description,
        teamId: triage.teamId,
        priority: triage.priority || 0,
        status: statusId,
        triageId: _id,
      },
      userId: user._id,
      subdomain: subdomain,
    });

    if (task) {
      if (reason) {
        await models.Note.createNote({
          doc: {
            content: reason,
            contentId: task._id,
            createdBy: user._id,
          },
          subdomain,
        });
      }

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
