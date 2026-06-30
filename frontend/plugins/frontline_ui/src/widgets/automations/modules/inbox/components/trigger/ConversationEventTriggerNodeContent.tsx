import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationNodeMetaInfoRow, useUsers } from 'ui-modules';
import type { AutomationTriggerConfigProps, IUser } from 'ui-modules';
import {
  getConversationEventActionLabelKey,
  getConversationEventGroupOption,
} from '../../constants/conversationEventTrigger';
import { TConversationEventTriggerForm } from '../../states/conversationEventTriggerForm';

export const ConversationEventTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TConversationEventTriggerForm>) => {
  const { t } = useTranslation('automations', {
    keyPrefix: 'conversation-event-trigger',
  });
  const conditions = config?.conditions || [];

  if (!conditions.length) {
    return (
      <AutomationNodeMetaInfoRow
        fieldName={t('events')}
        content={t('empty-summary')}
      />
    );
  }

  return (
    <div>
      {conditions.map((condition) => {
        const group = getConversationEventGroupOption(condition.type);
        const actions = condition.actions
          .map((action) =>
            t(getConversationEventActionLabelKey(condition.type, action)),
          )
          .join(', ');
        const targetIds = condition.targetIds || [];

        return (
          <div key={condition._id}>
            <AutomationNodeMetaInfoRow
              fieldName={group ? t(group.labelKey) : condition.type}
              content={actions || t('empty-summary')}
            />
            {group?.targetLabelKey ? (
              <AutomationNodeMetaInfoRow
                fieldName={t(group.targetLabelKey)}
                content={
                  group.type === 'assignee' ? (
                    <ConversationEventAssigneeTargetContent
                      targetIds={targetIds}
                      emptyText={t('empty-summary')}
                      loadingText={t('loading-summary')}
                    />
                  ) : targetIds.length ? (
                    targetIds.join(', ')
                  ) : (
                    t('empty-summary')
                  )
                }
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const ConversationEventAssigneeTargetContent = ({
  targetIds,
  emptyText,
  loadingText,
}: {
  targetIds: string[];
  emptyText: string;
  loadingText: string;
}) => {
  const uniqueTargetIds = useMemo(
    () => Array.from(new Set(targetIds.filter(Boolean))),
    [targetIds],
  );
  const { users, loading } = useUsers({
    skip: uniqueTargetIds.length === 0,
    variables: {
      ids: uniqueTargetIds,
      limit: uniqueTargetIds.length || 1,
    },
  });

  if (!uniqueTargetIds.length) {
    return emptyText;
  }

  if (loading) {
    return loadingText;
  }

  const usersById = new Map(users.map((user) => [user._id, user]));

  return uniqueTargetIds
    .map((targetId) => getUserDisplayName(usersById.get(targetId), targetId))
    .join(', ');
};

const getUserDisplayName = (user: IUser | undefined, fallback: string) =>
  user?.details?.fullName || user?.email || user?.username || fallback;
