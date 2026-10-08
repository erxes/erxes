import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Form, Select } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  RecordPickerWidget,
  SelectBoard,
  SelectPipeline,
  SelectStage,
} from 'ui-modules';
import { PROBABILITY_DEAL } from '@/deals/constants/stages';
import {
  LOYALTY_RULE_TYPES,
  SCORE_CAMPAIGN_CONTENT_TYPE,
  TLoyaltyRuleType,
} from '../constants';
import { useScoreCampaignTitles } from '../hooks/useScoreCampaignTitles';
import { TLoyaltyRulesForm } from '../types';

const NONE = 'none';

type TRowField =
  | 'scoreCampaignId'
  | 'boardId'
  | 'pipelineId'
  | 'earnProbability'
  | 'refundProbability'
  | 'earnStageIds'
  | 'refundStageIds';

type TRowProps = {
  control: Control<TLoyaltyRulesForm>;
  index: number;
};

const toIds = (value: string[] | string) =>
  Array.isArray(value) ? value : value ? [value] : [];

const RowField = ({
  control,
  index,
  name,
  label,
  render,
}: TRowProps & {
  name: TRowField;
  label: string;
  render: (field: {
    value: unknown;
    onChange: (value: unknown) => void;
  }) => React.ReactNode;
}) => {
  const { t } = useTranslation('sales');

  return (
    <Form.Field
      control={control}
      name={`rules.${index}.${name}`}
      render={({ field, fieldState }) => (
        <Form.Item className="min-w-0 flex-1">
          <Form.Label className="text-xs">{label}</Form.Label>
          {render(field)}
          {fieldState.error?.message && (
            <p className="text-xs text-destructive">
              {t(fieldState.error.message)}
            </p>
          )}
        </Form.Item>
      )}
    />
  );
};

const ProbabilitySelect = ({
  value,
  onChange,
  optional,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  optional?: boolean;
}) => {
  const { t } = useTranslation('sales');

  return (
    <Select
      value={typeof value === 'string' && value ? value : NONE}
      onValueChange={(next) => onChange(next === NONE ? undefined : next)}
    >
      <Form.Control>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {optional && (
          <Select.Item value={NONE}>{t('loyalty-rules-nowhere')}</Select.Item>
        )}
        {PROBABILITY_DEAL.map((probability) => (
          <Select.Item key={probability} value={probability}>
            {probability}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

export const LoyaltyRuleRow = ({
  control,
  index,
  type,
  overrides,
  onRemove,
}: TRowProps & {
  type: TLoyaltyRuleType;
  overrides: boolean;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('sales');
  const [boardId, pipelineId, scoreCampaignId] = useWatch({
    control,
    name: [
      `rules.${index}.boardId`,
      `rules.${index}.pipelineId`,
      `rules.${index}.scoreCampaignId`,
    ],
  });
  const { inactive } = useScoreCampaignTitles();
  const specific = type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;

  return (
    <div className="flex flex-col gap-2 border-t py-3">
      <div className="flex items-start gap-2">
        {type !== LOYALTY_RULE_TYPES.EVERY_BOARD && (
          <RowField
            control={control}
            index={index}
            name="boardId"
            label={t('board')}
            render={(field) => (
              <SelectBoard.FormItem
                mode="single"
                value={(field.value as string) || ''}
                onValueChange={field.onChange}
              />
            )}
          />
        )}
        {specific && (
          <RowField
            control={control}
            index={index}
            name="pipelineId"
            label={t('pipeline')}
            render={(field) => (
              <SelectPipeline.FormItem
                mode="single"
                value={(field.value as string) || ''}
                onValueChange={field.onChange}
                boardId={boardId}
              />
            )}
          />
        )}
        <RowField
          control={control}
          index={index}
          name="scoreCampaignId"
          label={t('score-campaign')}
          render={(field) => (
            <RecordPickerWidget
              contentType={SCORE_CAMPAIGN_CONTENT_TYPE}
              value={(field.value as string) || ''}
              onValueChange={field.onChange}
              placeholder={t('score-campaigns')}
            />
          )}
        />
        {specific ? (
          <>
            <RowField
              control={control}
              index={index}
              name="earnStageIds"
              label={t('loyalty-rules-earn-stages')}
              render={(field) => (
                <SelectStage.FormItem
                  mode="multiple"
                  autoSelectFirst={false}
                  value={(field.value as string[]) || []}
                  onValueChange={(value) => field.onChange(toIds(value))}
                  pipelineId={pipelineId}
                />
              )}
            />
            <RowField
              control={control}
              index={index}
              name="refundStageIds"
              label={t('loyalty-rules-refund-stages')}
              render={(field) => (
                <SelectStage.FormItem
                  mode="multiple"
                  autoSelectFirst={false}
                  value={(field.value as string[]) || []}
                  onValueChange={(value) => field.onChange(toIds(value))}
                  pipelineId={pipelineId}
                />
              )}
            />
          </>
        ) : (
          <>
            <RowField
              control={control}
              index={index}
              name="earnProbability"
              label={t('loyalty-rules-earn-at')}
              render={(field) => <ProbabilitySelect {...field} />}
            />
            <RowField
              control={control}
              index={index}
              name="refundProbability"
              label={t('loyalty-rules-refund-at')}
              render={(field) => <ProbabilitySelect {...field} optional />}
            />
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-6 shrink-0 text-destructive"
          onClick={onRemove}
          aria-label={t('remove')}
        >
          <IconTrash />
        </Button>
      </div>
      {inactive(scoreCampaignId) && (
        <Badge variant="warning" className="self-start">
          <IconAlertTriangle />
          {t('loyalty-rules-campaign-inactive')}
        </Badge>
      )}
      {overrides && (
        <Badge variant="warning" className="self-start">
          <IconAlertTriangle />
          {t(
            specific
              ? 'loyalty-rules-overrides-stages'
              : 'loyalty-rules-overrides-board',
          )}
        </Badge>
      )}
    </div>
  );
};
