import { zodResolver } from '@hookform/resolvers/zod';
import { IconRefresh, IconTag, IconUser } from '@tabler/icons-react';
import { Checkbox, cn, Form, ToggleGroup, toast } from 'erxes-ui';
import type { ComponentType } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  generateAutomationElementId,
  useAutomationRemoteFormSubmit,
  SelectMember,
  SelectTags,
} from 'ui-modules';
import {
  CONVERSATION_EVENT_GROUP_OPTIONS,
  TConversationEventGroup,
  TConversationEventGroupOption,
} from '../../constants/conversationEventTrigger';
import {
  conversationEventTriggerFormSchema,
  TConversationEventCondition,
  TConversationEventTriggerForm,
} from '../../states/conversationEventTriggerForm';

const EVENT_GROUP_ICONS: Record<
  TConversationEventGroup,
  ComponentType<{ className?: string }>
> = {
  assignee: IconUser,
  status: IconRefresh,
  tag: IconTag,
};

export const ConversationEventTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps<TConversationEventTriggerForm>) => {
  const { t } = useTranslation('automations', {
    keyPrefix: 'conversation-event-trigger',
  });
  const form = useForm<TConversationEventTriggerForm>({
    resolver: zodResolver(conversationEventTriggerFormSchema),
    defaultValues: {
      conditions: activeTrigger?.config?.conditions || [],
    },
  });
  const conditions =
    useWatch({
      control: form.control,
      name: 'conditions',
    }) || [];
  const { submitCount } = form.formState;

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      form.handleSubmit(onSaveTriggerConfig, () => {
        toast({
          title: t('validation-error-title'),
          description: t('validation-error-description'),
          variant: 'destructive',
        });
      })();
    },
  });

  const setConditions = (nextConditions: TConversationEventCondition[]) => {
    form.setValue('conditions', nextConditions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const setGroupSelected = (
    group: TConversationEventGroupOption,
    selected: boolean,
  ) => {
    if (!selected) {
      setConditions(
        conditions.filter((condition) => condition.type !== group.type),
      );
      return;
    }

    if (conditions.some((condition) => condition.type === group.type)) {
      return;
    }

    setConditions([
      ...conditions,
      {
        _id: generateAutomationElementId(),
        type: group.type,
        actions: group.actions.map(({ value }) => value),
        targetIds: [],
      },
    ]);
  };

  const setGroupActions = (
    groupType: TConversationEventGroup,
    actions: string[],
  ) => {
    setConditions(
      conditions.map((condition) =>
        condition.type === groupType ? { ...condition, actions } : condition,
      ),
    );
  };

  const setGroupTargets = (
    groupType: TConversationEventGroup,
    targetIds: string[],
  ) => {
    setConditions(
      conditions.map((condition) =>
        condition.type === groupType ? { ...condition, targetIds } : condition,
      ),
    );
  };

  return (
    <Form {...form}>
      <div className="flex h-full flex-col p-4">
        <Form.Field
          control={form.control}
          name="conditions"
          render={() => (
            <Form.Item>
              <Form.Label>{t('event-groups')}</Form.Label>
              <div className="flex flex-col gap-3">
                {CONVERSATION_EVENT_GROUP_OPTIONS.map((group) => {
                  const condition = conditions.find(
                    ({ type }) => type === group.type,
                  );

                  return (
                    <ConversationEventGroupCard
                      key={group.type}
                      group={group}
                      isSelected={Boolean(condition)}
                      selectedActions={condition?.actions || []}
                      selectedTargetIds={condition?.targetIds || []}
                      showValidationErrors={submitCount > 0}
                      onSelectedChange={(selected) =>
                        setGroupSelected(group, selected)
                      }
                      onActionsChange={(actions) =>
                        setGroupActions(group.type, actions)
                      }
                      onTargetsChange={(targetIds) =>
                        setGroupTargets(group.type, targetIds)
                      }
                    />
                  );
                })}
              </div>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};

type ConversationEventGroupCardProps = {
  group: TConversationEventGroupOption;
  isSelected: boolean;
  selectedActions: string[];
  selectedTargetIds: string[];
  showValidationErrors: boolean;
  onSelectedChange: (selected: boolean) => void;
  onActionsChange: (actions: string[]) => void;
  onTargetsChange: (targetIds: string[]) => void;
};

const ConversationEventGroupCard = ({
  group,
  isSelected,
  selectedActions,
  selectedTargetIds,
  showValidationErrors,
  onSelectedChange,
  onActionsChange,
  onTargetsChange,
}: ConversationEventGroupCardProps) => {
  const { t } = useTranslation('automations', {
    keyPrefix: 'conversation-event-trigger',
  });
  const Icon = EVENT_GROUP_ICONS[group.type];
  const hasActionError =
    showValidationErrors && isSelected && selectedActions.length === 0;
  const hasTargetError =
    showValidationErrors &&
    isSelected &&
    group.type !== 'status' &&
    selectedTargetIds.length === 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded border p-4 transition-colors',
        isSelected ? 'border-primary bg-muted/40' : 'bg-background',
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectedChange(Boolean(checked))}
        />
        <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t(group.labelKey)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(group.descriptionKey)}
          </p>
        </div>
      </div>

      <ToggleGroup
        type="multiple"
        value={selectedActions}
        onValueChange={onActionsChange}
        variant="outline"
        className="flex flex-wrap justify-start"
        disabled={!isSelected}
      >
        {group.actions.map((action) => (
          <ToggleGroup.Item
            key={action.value}
            value={action.value}
            aria-label={t(action.labelKey)}
            className="h-8 px-3 text-xs"
          >
            {t(action.labelKey)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      {hasActionError ? (
        <p className="text-xs text-destructive">{t('action-required')}</p>
      ) : null}

      {group.type === 'assignee' && isSelected ? (
        <Form.Item>
          <Form.Label>{t(group.targetLabelKey || '')}</Form.Label>
          <SelectMember.FormItem
            mode="multiple"
            value={selectedTargetIds}
            onValueChange={(value) => onTargetsChange(normalizeIds(value))}
            placeholder={t(group.targetPlaceholderKey || '')}
          />
          {hasTargetError ? (
            <p className="text-xs text-destructive">{t('target-required')}</p>
          ) : null}
        </Form.Item>
      ) : null}

      {group.type === 'tag' && isSelected ? (
        <Form.Item>
          <Form.Label>{t(group.targetLabelKey || '')}</Form.Label>
          <SelectTags.FormItem
            mode="multiple"
            tagType="frontline:conversation"
            value={selectedTargetIds}
            onValueChange={(value) => onTargetsChange(normalizeIds(value))}
          />
          {hasTargetError ? (
            <p className="text-xs text-destructive">{t('target-required')}</p>
          ) : null}
        </Form.Item>
      ) : null}
    </div>
  );
};

const normalizeIds = (value: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
};
