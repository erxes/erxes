import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IProject } from '@/project/@types/project';
import {
  getAutomationUserId,
  getNumber,
  getString,
  parseDate,
  toRecord,
  toStringList,
} from '~/modules/automations/utils';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

type TCreateProjectActionParams = {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
};

const getOptionalStringList = (value: unknown): string[] | undefined => {
  const values = toStringList(value);

  return values.length ? values : undefined;
};

const getTeamIds = (data: Record<string, unknown>) => {
  const teamIds = [...toStringList(data.teamIds), ...toStringList(data.teamId)];

  return Array.from(new Set(teamIds));
};

const buildProjectDoc = (
  data: Record<string, unknown>,
  createdBy: string,
): IProject => {
  const name = getString(data, 'name');
  const teamIds = getTeamIds(data);

  if (!name) {
    throw new Error('Project name is required');
  }

  if (!teamIds.length) {
    throw new Error('Project team is required');
  }

  return {
    name,
    teamIds,
    description: getString(data, 'description'),
    tagIds: getOptionalStringList(data.tagIds),
    priority: getNumber(data, 'priority') || 0,
    status: getNumber(data, 'status') || 0,
    startDate: parseDate(data.startDate),
    targetDate: parseDate(data.targetDate),
    leadId: getString(data, 'leadId'),
    memberIds: getOptionalStringList(data.memberIds),
    createdBy,
    convertedFromId: getString(data, 'convertedFromId'),
  };
};

export const createProjectAction = async ({
  models,
  subdomain,
  action,
  execution,
}: TCreateProjectActionParams) => {
  const resolvedConfig = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: toRecord(action.config),
    defaultValue: '',
  });
  const target = toRecord(execution.target);
  const userId = getAutomationUserId(resolvedConfig, target);

  if (!userId) {
    throw new Error('Project automation requires a user to create project');
  }

  const project = await models.Project.create(
    buildProjectDoc(resolvedConfig, userId),
  );

  graphqlPubsub.publish(`operationProjectChanged:${project._id}`, {
    operationProjectChanged: {
      type: 'create',
      project,
    },
  });

  graphqlPubsub.publish('operationProjectListChanged', {
    operationProjectListChanged: {
      type: 'create',
      project,
    },
  });

  return {
    targetId: project._id,
    name: project.name,
    teamIds: project.teamIds,
    status: project.status,
    priority: project.priority,
    leadId: project.leadId,
  };
};
