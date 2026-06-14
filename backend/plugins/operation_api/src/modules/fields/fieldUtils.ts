import { generateFieldsFromSchema } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '~/modules/status/constants/types';

type TSelectOption = {
  label: string;
  value: string | number;
};

type TSelectionConfig = {
  queryName: string;
  labelField: string;
  valueField?: string;
  multi?: boolean;
};

type TOperationField = {
  _id: string | number;
  name: string;
  group?: string;
  label?: string;
  type?: string;
  validation?: string;
  options?: TSelectOption[];
  selectOptions?: TSelectOption[];
  configs?: TSelectionConfig;
  selectionConfig?: TSelectionConfig;
};

type TGenerateOperationFieldsData = {
  collectionType?: string;
  config?: Record<string, unknown>;
};

type TTag = {
  _id?: unknown;
  name?: unknown;
};

const PRIORITY_OPTIONS = ['No Priority', 'Minor', 'Medium', 'High', 'Critical'];

const STATUS_TYPE_LABELS: Record<number, string> = {
  [STATUS_TYPES.STARTED]: 'In Progress',
  [STATUS_TYPES.UNSTARTED]: 'Todo',
  [STATUS_TYPES.BACKLOG]: 'Backlog',
  [STATUS_TYPES.COMPLETED]: 'Done',
  [STATUS_TYPES.CANCELLED]: 'Cancelled',
};

const TASK_FIELD_NAMES_WITH_OPTIONS = new Set([
  'teamId',
  'status',
  'statusType',
  'priority',
  'tagIds',
  'assigneeId',
  'createdBy',
  'cycleId',
  'projectId',
  'milestoneId',
]);

const PROJECT_FIELD_NAMES_WITH_OPTIONS = new Set([
  'teamIds',
  'status',
  'priority',
  'tagIds',
  'leadId',
  'memberIds',
  'createdBy',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isOperationField = (value: unknown): value is TOperationField =>
  isRecord(value) &&
  (typeof value._id === 'string' || typeof value._id === 'number') &&
  typeof value.name === 'string';

const isTag = (value: unknown): value is TTag => isRecord(value);

const toStringValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const stringValue = String(value).trim();

  return stringValue || undefined;
};

const toOption = (
  value: unknown,
  label: unknown,
): TSelectOption | undefined => {
  const optionValue = toStringValue(value);
  const optionLabel = toStringValue(label) || optionValue;

  return optionValue && optionLabel
    ? { value: optionValue, label: optionLabel }
    : undefined;
};

const withStaticOptions = ({
  name,
  label,
  type,
  options,
}: {
  name: string;
  label: string;
  type: string;
  options: TSelectOption[];
}): TOperationField => ({
  _id: name,
  name,
  label,
  type,
  options,
  selectOptions: options,
});

const withQueryConfig = ({
  name,
  label,
  type,
  configs,
}: {
  name: string;
  label: string;
  type: string;
  configs: TSelectionConfig;
}): TOperationField => ({
  _id: name,
  name,
  label,
  type,
  configs,
  selectionConfig: configs,
});

const normalizeField = (field: TOperationField): TOperationField => {
  if (field.options || !field.selectOptions) {
    return field;
  }

  return {
    ...field,
    options: field.selectOptions,
  };
};

const generateUsersOptions = (name: string, label: string, multi = false) =>
  withQueryConfig({
    name,
    label,
    type: 'user',
    configs: {
      queryName: 'users',
      labelField: 'email',
      multi,
    },
  });

const getSchemaFields = async (
  schema: Schema | undefined,
  excludedFieldNames: Set<string>,
) => {
  if (!schema) {
    return [];
  }

  const generatedFields: unknown = await generateFieldsFromSchema(schema, '');
  const fields = Array.isArray(generatedFields)
    ? generatedFields.filter(isOperationField).map(normalizeField)
    : [];

  return fields.filter((field) => !excludedFieldNames.has(field.name));
};

const getTeamOptions = async (models: IModels, name = 'teamId') => {
  const teams = await models.Team.find({}).sort({ name: 1 }).lean();
  const options = teams
    .map((team) => toOption(team._id, team.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name,
    label: name === 'teamIds' ? 'Teams' : 'Team',
    type: 'team',
    options,
  });
};

const getTaskStatusOptions = async (models: IModels, teamId?: string) => {
  const selector = teamId ? { teamId } : {};
  const statuses = await models.Status.find(selector)
    .sort({ teamId: 1, order: 1, name: 1 })
    .lean();
  const options = statuses
    .map((status) => toOption(status._id, status.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'status',
    label: 'Status',
    type: 'status',
    options,
  });
};

const getStatusTypeOptions = () =>
  withStaticOptions({
    name: 'statusType',
    label: 'Status type',
    type: 'Number',
    options: Object.values(STATUS_TYPES)
      .filter((value) => value !== STATUS_TYPES.TRIAGE)
      .map((value) => ({
        value,
        label: STATUS_TYPE_LABELS[value] || String(value),
      })),
  });

const getProjectStatusOptions = () =>
  withStaticOptions({
    name: 'status',
    label: 'Status',
    type: 'Number',
    options: Object.values(STATUS_TYPES)
      .filter((value) => value !== STATUS_TYPES.TRIAGE)
      .map((value) => ({
        value,
        label: STATUS_TYPE_LABELS[value] || String(value),
      })),
  });

const getPriorityOptions = () =>
  withStaticOptions({
    name: 'priority',
    label: 'Priority',
    type: 'Number',
    options: PRIORITY_OPTIONS.map((label, value) => ({
      value,
      label,
    })),
  });

const getProjectOptions = async (models: IModels, teamId?: string) => {
  const selector = teamId ? { teamIds: teamId } : {};
  const projects = await models.Project.find(selector).sort({ name: 1 }).lean();
  const options = projects
    .map((project) => toOption(project._id, project.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'projectId',
    label: 'Project',
    type: 'project',
    options,
  });
};

const getMilestoneOptions = async (models: IModels, projectId?: string) => {
  const selector = projectId ? { projectId } : {};
  const milestones = await models.Milestone.find(selector)
    .sort({ targetDate: 1, name: 1 })
    .lean();
  const options = milestones
    .map((milestone) => toOption(milestone._id, milestone.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'milestoneId',
    label: 'Milestone',
    type: 'milestone',
    options,
  });
};

const getCycleOptions = async (models: IModels, teamId?: string) => {
  const selector = teamId ? { teamId } : {};
  const cycles = await models.Cycle.find(selector)
    .sort({ startDate: 1, name: 1 })
    .lean();
  const options = cycles
    .map((cycle) => toOption(cycle._id, cycle.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'cycleId',
    label: 'Cycle',
    type: 'cycle',
    options,
  });
};

const generateTagOptions = async (subdomain: string, tagType: string) => {
  const tags: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'find',
    input: {
      type: tagType,
    },
    defaultValue: [],
  });
  const tagList = Array.isArray(tags) ? tags.filter(isTag) : [];
  const options = tagList
    .map((tag) => toOption(tag._id, tag.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'tagIds',
    label: 'Tags',
    type: 'tags',
    options,
  });
};

export const generateTaskFields = async ({
  models,
  subdomain,
  data,
}: {
  models: IModels;
  subdomain: string;
  data: TGenerateOperationFieldsData;
}) => {
  const { collectionType, config = {} } = data;

  if (collectionType && collectionType !== 'tasks') {
    return [];
  }

  const teamId = toStringValue(config.teamId);
  const projectId = toStringValue(config.projectId);

  return [
    ...(await getSchemaFields(
      models.Task.schema,
      TASK_FIELD_NAMES_WITH_OPTIONS,
    )),
    await getTeamOptions(models),
    await getTaskStatusOptions(models, teamId),
    getStatusTypeOptions(),
    getPriorityOptions(),
    generateUsersOptions('assigneeId', 'Assignee'),
    generateUsersOptions('createdBy', 'Created by'),
    await getCycleOptions(models, teamId),
    await getProjectOptions(models, teamId),
    await getMilestoneOptions(models, projectId),
    await generateTagOptions(subdomain, 'operation:task'),
  ];
};

export const generateProjectFields = async ({
  models,
  subdomain,
  data,
}: {
  models: IModels;
  subdomain: string;
  data: TGenerateOperationFieldsData;
}) => {
  const { collectionType } = data;

  if (collectionType && collectionType !== 'projects') {
    return [];
  }

  return [
    ...(await getSchemaFields(
      models.Project.schema,
      PROJECT_FIELD_NAMES_WITH_OPTIONS,
    )),
    await getTeamOptions(models, 'teamIds'),
    getProjectStatusOptions(),
    getPriorityOptions(),
    generateUsersOptions('leadId', 'Lead'),
    generateUsersOptions('memberIds', 'Members', true),
    generateUsersOptions('createdBy', 'Created by'),
    await generateTagOptions(subdomain, 'operation:project'),
  ];
};
