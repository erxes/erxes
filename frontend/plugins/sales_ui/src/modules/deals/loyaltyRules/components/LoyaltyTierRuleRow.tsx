import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Form } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { LOYALTY_RULE_TYPES, TLoyaltyRuleType } from '../constants';
import { useLoyaltyTierRuleRow } from '../hooks/useLoyaltyTierRuleRow';
import { TLoyaltyTierRulesForm } from '../types';
import { ProbabilitySelect, toIds } from './LoyaltyRuleRow';
import { TierBandsFields } from './TierBandsFields';
import { TierWalletSelect } from './TierWalletSelect';

type TRowField =
  | 'boardId'
  | 'pipelineId'
  | 'accountTypeId'
  | 'earnProbability'
  | 'earnStageIds';

const ErrorText = ({ message }: { message?: string }) => {
  const { t } = useTranslation('sales');

  return message ? (
    <p className="text-xs text-destructive">{t(message)}</p>
  ) : null;
};

const RowField = ({
  control,
  index,
  name,
  label,
  render,
}: {
  control: Control<TLoyaltyTierRulesForm>;
  index: number;
  name: TRowField;
  label: string;
  render: (field: {
    value: unknown;
    onChange: (value: unknown) => void;
  }) => React.ReactNode;
}) => (
  <Form.Field
    control={control}
    name={`rules.${index}.${name}`}
    render={({ field, fieldState }) => (
      <Form.Item className="min-w-0 flex-1">
        <Form.Label className="text-xs">{label}</Form.Label>
        {render(field)}
        <ErrorText message={fieldState.error?.message} />
      </Form.Item>
    )}
  />
);

export const LoyaltyTierRuleRow = ({
  control,
  index,
  type,
  onRemove,
}: {
  control: Control<TLoyaltyTierRulesForm>;
  index: number;
  type: TLoyaltyRuleType;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('sales');
  const {
    boardId,
    pipelineId,
    accountTypeId,
    resetBands,
    tiers,
    bandsValue,
    bandsError,
    changeBands,
    overrides,
  } = useLoyaltyTierRuleRow(control, index);
  const specific = type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;

  return (
    <div className="flex flex-col gap-3 border-t py-3">
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
          name="accountTypeId"
          label={t('loyalty-tier-wallet')}
          render={(field) => (
            <TierWalletSelect
              value={(field.value as string) || ''}
              onChange={(next) => {
                field.onChange(next);
                resetBands();
              }}
            />
          )}
        />
        {specific ? (
          <RowField
            control={control}
            index={index}
            name="earnStageIds"
            label={t('loyalty-tier-set-stages')}
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
        ) : (
          <RowField
            control={control}
            index={index}
            name="earnProbability"
            label={t('loyalty-tier-set-at')}
            render={(field) => <ProbabilitySelect {...field} />}
          />
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
      {accountTypeId && (
        <TierBandsFields
          tiers={tiers}
          value={bandsValue}
          onChange={changeBands}
        />
      )}
      <ErrorText message={bandsError} />
      {overrides && (
        <Badge variant="warning" className="self-start">
          <IconAlertTriangle />
          {t(
            specific
              ? 'loyalty-tier-overrides-stages'
              : 'loyalty-tier-overrides-board',
          )}
        </Badge>
      )}
    </div>
  );
};
