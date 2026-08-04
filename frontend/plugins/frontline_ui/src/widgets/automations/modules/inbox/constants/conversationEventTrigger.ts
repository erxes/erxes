export type TConversationEventGroup = 'assignee' | 'status' | 'tag';

export type TConversationEventGroupOption = {
  type: TConversationEventGroup;
  labelKey: string;
  descriptionKey: string;
  targetLabelKey?: string;
  targetPlaceholderKey?: string;
  actions: Array<{
    value: string;
    labelKey: string;
  }>;
};

export const CONVERSATION_EVENT_GROUP_OPTIONS: TConversationEventGroupOption[] =
  [
    {
      type: 'assignee',
      labelKey: 'assignee.label',
      descriptionKey: 'assignee.description',
      targetLabelKey: 'assignee.target-label',
      targetPlaceholderKey: 'assignee.target-placeholder',
      actions: [
        {
          value: 'assigned',
          labelKey: 'assignee.actions.assigned',
        },
        {
          value: 'unassigned',
          labelKey: 'assignee.actions.unassigned',
        },
      ],
    },
    {
      type: 'status',
      labelKey: 'status.label',
      descriptionKey: 'status.description',
      actions: [
        {
          value: 'open',
          labelKey: 'status.actions.open',
        },
        {
          value: 'closed',
          labelKey: 'status.actions.closed',
        },
        {
          value: 'reopened',
          labelKey: 'status.actions.reopened',
        },
      ],
    },
    {
      type: 'tag',
      labelKey: 'tag.label',
      descriptionKey: 'tag.description',
      targetLabelKey: 'tag.target-label',
      targetPlaceholderKey: 'tag.target-placeholder',
      actions: [
        {
          value: 'added',
          labelKey: 'tag.actions.added',
        },
        {
          value: 'removed',
          labelKey: 'tag.actions.removed',
        },
      ],
    },
  ];

export const getConversationEventGroupOption = (
  type: TConversationEventGroup,
) => CONVERSATION_EVENT_GROUP_OPTIONS.find((option) => option.type === type);

export const getConversationEventActionLabelKey = (
  groupType: TConversationEventGroup,
  actionValue: string,
) =>
  getConversationEventGroupOption(groupType)?.actions.find(
    (action) => action.value === actionValue,
  )?.labelKey || actionValue;
