import {
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  TSendNotificationActionConfig,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

const toIds = (value: unknown): string[] => [
  ...new Set(
    (Array.isArray(value) ? value : String(value ?? '').split(','))
      .map((id) => String(id ?? '').trim())
      .filter(Boolean),
  ),
];

const toText = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

type TCreateNotification = (input: {
  userIds: string[];
  data: Record<string, unknown>;
}) => Promise<unknown>;

/**
 * An in-app notification to team members. It is stamped with the run's
 * `createdVia`, and comes from that run's actor — the automation's owner — so
 * a recipient sees who stands behind it; whoever should not appear there
 * transfers the automation's ownership. A run nobody owns sends a system
 * notification. It points at the record the run is about.
 */
export const executeNotificationActionWithDependencies = async ({
  subdomain,
  execution,
  action,
  createNotification,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction<TSendNotificationActionConfig>;
  createNotification: TCreateNotification;
}) => {
  const config = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });

  const userIds = toIds(config.userIds);
  const title = toText(config.title);

  if (!userIds.length) {
    return buildSkippedAction('no-recipients');
  }

  if (!title) {
    return buildSkippedAction('no-title');
  }

  const createdVia = execution.createdVia
    ? { ...execution.createdVia, runId: execution.createdVia.runId || execution._id }
    : undefined;
  const actorId = createdVia?.actorId;
  const priority = PRIORITIES.find((value) => value === config.priority);

  const data = {
    kind: actorId ? 'user' : 'system',
    ...(actorId
      ? {
          fromUserId: actorId,
          action: 'automation',
          notificationType: 'automation',
          allowMultiple: true,
        }
      : {}),
    title,
    // The model refuses an empty body; the title says it all then.
    message: toText(config.message) || title,
    type: 'info',
    ...(priority ? { priority } : {}),
    contentType: execution.triggerType,
    contentTypeId: execution.targetId,
    ...(createdVia ? { createdVia } : {}),
  };

  await createNotification({ userIds, data });

  return { notifiedUserIds: userIds, title };
};

export const executeNotificationAction = ({
  subdomain,
  execution,
  action,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction<TSendNotificationActionConfig>;
}) =>
  executeNotificationActionWithDependencies({
    subdomain,
    execution,
    action,
    createNotification: (input) =>
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'notifications',
        action: 'create',
        input,
        defaultValue: [],
      }),
  });
