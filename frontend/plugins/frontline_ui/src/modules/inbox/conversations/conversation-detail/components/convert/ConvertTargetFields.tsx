import { Form, Select } from 'erxes-ui';
import { ComponentType } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectBoard,
  SelectPipeline as SelectDealPipeline,
  SelectStage,
} from 'ui-modules';
import {
  useConvertTaskStatuses,
  useConvertTaskTeams,
} from '@/inbox/conversations/hooks/useConvertTaskTargets';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline as SelectTicketPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { ConvertField, ConvertTargetRow } from './ConvertFields';
import { TConvertFormReturn, toSingleValue } from './convertForm';

type TTargetFieldsProps = { form: TConvertFormReturn };

const ConvertOptionSelect = ({
  value,
  options,
  placeholder,
  disabled,
  onValueChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}) => (
  <Select value={value} disabled={disabled} onValueChange={onValueChange}>
    <Form.Control>
      <Select.Trigger>
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
    </Form.Control>
    <Select.Content>
      {options.map((option) => (
        <Select.Item key={option.value} value={option.value}>
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

const TicketTargetFields = ({ form }: TTargetFieldsProps) => {
  const { t } = useTranslation('frontline');

  return (
    <ConvertTargetRow columns={3}>
      <Form.Field
        name="channelId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('channel', 'Channel')}>
            <SelectChannel.FormItem
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue('pipelineId', '');
                form.setValue('stageId', '');
              }}
            />
          </ConvertField>
        )}
      />
      <Form.Field
        name="pipelineId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('pipeline-label', 'Pipeline')}>
            <SelectTicketPipeline.FormItem
              value={field.value || ''}
              form={form}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue('stageId', '');
              }}
            />
          </ConvertField>
        )}
      />
      <Form.Field
        name="stageId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('status-label', 'Status')}>
            <SelectStatusTicket.FormItem
              value={field.value}
              form={form}
              onValueChange={field.onChange}
            />
          </ConvertField>
        )}
      />
    </ConvertTargetRow>
  );
};

const DealTargetFields = ({ form }: TTargetFieldsProps) => {
  const { t } = useTranslation('frontline');
  const boardId = useWatch({ control: form.control, name: 'boardId' });
  const pipelineId = useWatch({ control: form.control, name: 'pipelineId' });

  return (
    <ConvertTargetRow columns={3}>
      <Form.Field
        name="boardId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('board', 'Board')}>
            <SelectBoard.FormItem
              mode="single"
              value={field.value || ''}
              placeholder={t('choose-board', 'Choose a board')}
              onValueChange={(value) => {
                field.onChange(toSingleValue(value));
                form.setValue('pipelineId', '');
                form.setValue('stageId', '');
              }}
            />
          </ConvertField>
        )}
      />
      <Form.Field
        name="pipelineId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('pipeline-label', 'Pipeline')}>
            <SelectDealPipeline.FormItem
              mode="single"
              boardId={boardId}
              value={field.value || ''}
              placeholder={t('choose-pipeline', 'Choose a pipeline')}
              onValueChange={(value) => {
                field.onChange(toSingleValue(value));
                form.setValue('stageId', '');
              }}
            />
          </ConvertField>
        )}
      />
      <Form.Field
        name="stageId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('stage', 'Stage')}>
            <SelectStage.FormItem
              mode="single"
              pipelineId={pipelineId}
              value={field.value}
              placeholder={t('choose-stage', 'Choose a stage')}
              onValueChange={(value) => field.onChange(toSingleValue(value))}
            />
          </ConvertField>
        )}
      />
    </ConvertTargetRow>
  );
};

const TaskTargetFields = ({ form }: TTargetFieldsProps) => {
  const { t } = useTranslation('frontline');
  const teamId = useWatch({ control: form.control, name: 'teamId' });
  const { teams, loading: teamsLoading } = useConvertTaskTeams();
  const { statuses, loading: statusesLoading } = useConvertTaskStatuses(teamId);

  return (
    <ConvertTargetRow columns={2}>
      <Form.Field
        name="teamId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('team', 'Team')}>
            <ConvertOptionSelect
              value={field.value || ''}
              disabled={teamsLoading}
              placeholder={t('choose-team', 'Choose a team')}
              options={teams.map((team) => ({
                value: team._id,
                label: team.name,
              }))}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue('stageId', '');
              }}
            />
          </ConvertField>
        )}
      />
      <Form.Field
        name="stageId"
        control={form.control}
        render={({ field }) => (
          <ConvertField label={t('status-label', 'Status')}>
            <ConvertOptionSelect
              value={field.value}
              disabled={!teamId || statusesLoading}
              placeholder={t('choose-status', 'Choose a status')}
              options={statuses}
              onValueChange={field.onChange}
            />
          </ConvertField>
        )}
      />
    </ConvertTargetRow>
  );
};

const TARGET_FIELDS: Record<
  ConversationConvertType,
  ComponentType<TTargetFieldsProps>
> = {
  ticket: TicketTargetFields,
  deal: DealTargetFields,
  task: TaskTargetFields,
};

export const ConvertTargetFields = ({
  type,
  form,
}: TTargetFieldsProps & { type: ConversationConvertType }) => {
  const Fields = TARGET_FIELDS[type];

  return <Fields form={form} />;
};
