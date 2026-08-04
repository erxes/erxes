import { sendNotification } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

const getTitle = (contentType: string) => {
  if (contentType === 'task') {
    return 'Task';
  }

  if (contentType === 'project') {
    return 'Project';
  }

  if (contentType === 'team') {
    return 'Team';
  }

  if (contentType === 'triage') {
    return 'Triage';
  }
};

const getMessage = (contentType: string, notificationType: string) => {
  switch (notificationType) {
    case 'taskAssignee':
      return 'You have been assigned to task';
    case 'taskStatus':
      return 'You have been assigned to task';
    case 'projectAssignee':
      return 'You have been assigned to project';
    case 'projectStatus':
      return 'You have been assigned to project';
    case 'note':
      return `You have been mentioned in ${contentType}'s note`;
    case 'team':
      return 'You have been invited to team';
    case 'triage':
      return 'Your team has a new triage';
    default:
      return 'Notification';
  }
};

const getContent = async (
  contentType: string,
  contentTypeId: string,
  models: IModels,
) => {
  let content;

  switch (contentType) {
    case 'task': {
      const task = await models.Task.findOne({ _id: contentTypeId }).lean();
      content = task?.name;
      break;
    }
    case 'project': {
      const project = await models.Project.findOne({
        _id: contentTypeId,
      }).lean();
      content = project?.name;
      break;
    }
    case 'team': {
      const team = await models.Team.findOne({ _id: contentTypeId }).lean();
      content = team?.name;
      break;
    }
    default:
      content = '';
  }

  return content;
};

export const createNotifications = async ({
  contentType,
  contentTypeId,
  fromUserId,
  subdomain,
  notificationType,
  userIds,
  action,
  models,
}: {
  contentType: string;
  contentTypeId: string;
  fromUserId: string;
  subdomain: string;
  notificationType: string;
  userIds: string[];
  action: string;
  models: IModels;
}) => {
  sendNotification(subdomain, {
    title: getTitle(contentType),
    message: getMessage(contentType, notificationType),
    type: 'info',
    userIds,
    priority: 'low',
    kind: 'user',
    fromUserId,
    contentType: `operation:${contentType}`,
    contentTypeId,
    notificationType,
    action,
    metadata: {
      contentTypeId,
    },
    content: await getContent(contentType, contentTypeId, models),
  });
};
