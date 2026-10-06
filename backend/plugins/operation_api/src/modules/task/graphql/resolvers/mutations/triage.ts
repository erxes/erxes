import { IContext } from '~/connectionResolvers';
import { ITriageAddInput, ITriageUpdateInput } from '@/task/@types/triage';
import { STATUS_TYPES } from '@/status/constants/types';

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
    { input }: { input: ITriageAddInput },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('triageCreate');

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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('triageUpdate');

    return models.Triage.updateTriage(_id, input);
  },

  operationCancelTriage: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('triageUpdate');

    const triage = await models.Triage.getTriage(_id);
    if (!triage) {
      throw new Error('Triage not found');
    }

    return models.Triage.updateTriage(_id, { status: STATUS_TYPES.CANCELLED });
  },

  operationConvertTriageToTask: async (
    _parent: undefined,
    { _id, status, reason }: { _id: string; status?: number; reason?: string },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('triageConvert');

    const triage = await models.Triage.getTriage(_id);
    if (!triage) {
      throw new Error('Triage not found');
    }

    let statusId: string | undefined = undefined;

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
        createdBy: triage.createdBy,
        githubIssueNumber: triage.githubIssueNumber,
        githubIssueUrl: triage.githubIssueUrl,
        githubRepoName: triage.githubRepoName,
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
      if (status !== STATUS_TYPES.CANCELLED) {
        await models.Activity.createActivity({
          action: 'ACCEPTED',
          contentId: task._id,
          module: 'TRIAGE_ACCEPTANCE',
          metadata: {
            newValue: task._id.toString(),
            previousValue: triage._id?.toString(),
          },
          createdBy: user._id,
        });
      }
      await models.Triage.deleteTriage(_id);
      return task;
    } else {
      throw new Error('Failed to convert triage to task');
    }
  },
};
