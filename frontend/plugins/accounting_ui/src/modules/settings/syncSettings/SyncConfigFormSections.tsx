import { Button, Form, Input, Spinner } from 'erxes-ui';
import {
  Control,
  FieldPath,
  FieldValues,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import {
  ISyncAccountsSectionFields,
  ISyncGeneralFields,
  ISyncPaymentsFields,
  ISyncReturnTypeFields,
  ISyncVatCtaxFields,
} from '@/settings/types/SyncConfig';
import {
  PANEL_INPUT_CLASS_NAME,
  SelectBoard,
  SelectBranches,
  SelectDepartments,
  SelectPipeline,
  SelectStage,
  PanelFormRow,
} from 'ui-modules';
import { useEffect, useMemo, useRef } from 'react';

import {
  SettingsPanelSelect,
  SettingsPanelSwitch,
} from '@/settings/components/panel/SettingsPanelFields';
import { FormSelectEbarimtProductRule } from './SelectEbarimtProductRule';
import { JournalEnum } from '@/settings/account/types/Account';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { SelectCtax } from '@/settings/ctax/components/SelectCtaxRow';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';
import { SyncSettingSection } from './SyncSettingSection';
import { TR_STATUS_OPTIONS } from '@/transactions/types/constants';
import { useTranslation } from 'react-i18next';

export interface IUsePipelineResetForm {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
}

export const usePipelineReset = <T extends IUsePipelineResetForm>(
  form: UseFormReturn<T>,
) => {
  const hasWatchedBoardId = useRef(false);
  const hasWatchedPipelineId = useRef(false);
  const previousBoardId = useRef<string | undefined>();
  const previousPipelineId = useRef<string | undefined>();

  const boardId = useWatch({
    control: form.control,
    name: 'boardId' as FieldPath<T>,
  }) as string | undefined;

  const pipelineId = useWatch({
    control: form.control,
    name: 'pipelineId' as FieldPath<T>,
  }) as string | undefined;

  useEffect(() => {
    if (!hasWatchedBoardId.current) {
      hasWatchedBoardId.current = true;
      previousBoardId.current = boardId;
      return;
    }

    if (previousBoardId.current !== boardId) {
      form.setValue('pipelineId' as FieldPath<T>, '' as never);
      previousBoardId.current = boardId;
    }
  }, [boardId, form]);

  useEffect(() => {
    if (!hasWatchedPipelineId.current) {
      hasWatchedPipelineId.current = true;
      previousPipelineId.current = pipelineId;
      return;
    }

    if (previousPipelineId.current !== pipelineId) {
      form.setValue('stageId' as FieldPath<T>, '' as never);
      previousPipelineId.current = pipelineId;
    }
  }, [pipelineId, form]);

  return { boardId, pipelineId };
};

export const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

export const normalizeSyncConfigData = <
  T extends {
    hasVat?: boolean;
    hasCtax?: boolean;
    vatRowId?: string;
    ctaxRowId?: string;
    reverseVatRules?: string | string[];
    reverseCtaxRules?: string | string[];
  },
>(
  data: T,
  mongolianEnabled: boolean,
): T => ({
  ...data,
  vatRowId: data.hasVat ? data.vatRowId ?? '' : '',
  reverseVatRules:
    mongolianEnabled && !data.hasVat
      ? normalizeRuleIds(data.reverseVatRules)
      : [],
  ctaxRowId: data.hasCtax ? data.ctaxRowId ?? '' : '',
  reverseCtaxRules:
    !mongolianEnabled || data.hasCtax
      ? []
      : normalizeRuleIds(data.reverseCtaxRules),
});

export const SyncConfigPaymentAccountField = <
  TFieldValues extends FieldValues,
>({
  control,
  name,
  label,
  currency,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  currency?: string;
}) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <PanelFormRow label={label}>
          <SelectAccount.FormItem
            value={field.value}
            onValueChange={field.onChange}
            className={PANEL_INPUT_CLASS_NAME}
            defaultFilter={{
              journals: [JournalEnum.BANK, JournalEnum.CASH, JournalEnum.DEBT],
              ...(currency ? { currency } : {}),
            }}
          />
        </PanelFormRow>
      )}
    />
  );
};

const ReturnTypeFieldContent = ({
  field,
}: {
  field: { value: string; onChange: (v: string) => void };
}) => {
  const { t } = useTranslation('accounting');

  return (
    <PanelFormRow label={t('return-type')}>
      <SettingsPanelSelect
        value={field.value}
        placeholder={t('return-type')}
        options={[
          { value: 'fullTr', label: t('full-tr') },
          { value: 'onlySale', label: t('only-sale') },
          { value: 'delete', label: t('delete') },
        ]}
        onValueChange={field.onChange}
        className={PANEL_INPUT_CLASS_NAME}
      />
    </PanelFormRow>
  );
};

export const SyncConfigReturnTypeField = <
  TFieldValues extends FieldValues & ISyncReturnTypeFields,
>({
  control,
}: {
  control: Control<TFieldValues>;
}) => {
  return (
    <Form.Field
      control={control}
      name={'returnType' as FieldPath<TFieldValues>}
      render={({ field }) => <ReturnTypeFieldContent field={field} />}
    />
  );
};

const DateRuleFieldContent = ({
  field,
}: {
  field: { value: string; onChange: (v: string) => void };
}) => {
  const { t } = useTranslation('accounting');

  return (
    <PanelFormRow label={t('date-rule')}>
      <SettingsPanelSelect
        value={field.value}
        placeholder={t('date-rule')}
        options={[
          { value: 'alwaysNow', label: t('always-now') },
          { value: 'syncedDateOrNow', label: t('synced-date-or-now') },
        ]}
        onValueChange={field.onChange}
        className={PANEL_INPUT_CLASS_NAME}
      />
    </PanelFormRow>
  );
};

const TrStatusFieldContent = ({
  field,
}: {
  field: { value: string; onChange: (v: string) => void };
}) => {
  const { t } = useTranslation('accounting');
  return (
    <PanelFormRow label={t('tr-status-label')}>
      <SettingsPanelSelect
        value={field.value}
        placeholder={t('tr-status-label')}
        options={TR_STATUS_OPTIONS.map((s) => ({
          value: s.value,
          label: t(s.label || '', { nsSeparator: false }),
        }))}
        onValueChange={field.onChange}
        className={PANEL_INPUT_CLASS_NAME}
      />
    </PanelFormRow>
  );
};

export const SyncConfigGeneralFields = <
  TFieldValues extends FieldValues & ISyncGeneralFields,
>({
  control,
}: {
  control: Control<TFieldValues>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      <Form.Field
        control={control}
        name={'title' as FieldPath<TFieldValues>}
        render={({ field, fieldState }) => (
          <PanelFormRow label={t('title')} error={fieldState.error?.message}>
            <Input
              {...field}
              value={field.value ?? ''}
              autoComplete="off"
              placeholder={t('title')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={control}
        name={'dateRule' as FieldPath<TFieldValues>}
        render={({ field }) => <DateRuleFieldContent field={field} />}
      />
      <Form.Field
        control={control}
        name={'trStatus' as FieldPath<TFieldValues>}
        render={({ field }) => <TrStatusFieldContent field={field} />}
      />
    </>
  );
};

export const SyncConfigPipelineSection = <T extends IUsePipelineResetForm>({
  boardId,
  pipelineId,
  form,
}: {
  boardId?: string;
  pipelineId?: string;
  form: UseFormReturn<T>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SyncSettingSection title={t('pipeline')}>
      <Form.Field
        control={form.control}
        name={'boardId' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow label={t('board')} error={fieldState.error?.message}>
            <SelectBoard.FormItem
              mode="single"
              value={field.value}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name={'pipelineId' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow label={t('pipeline')} error={fieldState.error?.message}>
            <SelectPipeline.FormItem
              mode="single"
              value={field.value}
              boardId={boardId || undefined}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name={'stageId' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow label={t('stage')} error={fieldState.error?.message}>
            <SelectStage.FormItem
              mode="single"
              value={field.value}
              pipelineId={pipelineId || undefined}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <SyncResponseFieldSelect form={form} />
    </SyncSettingSection>
  );
};

export const SyncConfigAccountsSection = <
  TFieldValues extends FieldValues & ISyncAccountsSectionFields,
>({
  control,
}: {
  control: Control<TFieldValues>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SyncSettingSection title={t('accounts')}>
      <Form.Field
        control={control}
        name={'saleAccountId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <PanelFormRow label={t('sale-account')}>
            <SelectAccount.FormItem
              value={field.value}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
              defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={control}
        name={'saleOutAccountId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <PanelFormRow label={t('sale-out-account')}>
            <SelectAccount.FormItem
              value={field.value}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
              defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={control}
        name={'saleCostAccountId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <PanelFormRow label={t('sale-cost-account')}>
            <SelectAccount.FormItem
              value={field.value}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
              defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={control}
        name={'branchId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <PanelFormRow label={t('branch')}>
            <SelectBranches.FormItem
              mode="single"
              value={field.value}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
      <Form.Field
        control={control}
        name={'departmentId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <PanelFormRow label={t('department')}>
            <SelectDepartments.FormItem
              mode="single"
              value={field.value}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
    </SyncSettingSection>
  );
};

export type TPaymentType = {
  type: string;
  title: string;
};

export const SyncConfigPaymentsSection = <
  TFieldValues extends FieldValues & ISyncPaymentsFields,
>({
  control,
  paymentTypes,
  paymentKey,
  currency,
}: {
  control: Control<TFieldValues>;
  paymentTypes: TPaymentType[];
  paymentKey: string;
  currency?: string;
}) => {
  const { t } = useTranslation('accounting');

  const paymentList = useMemo(
    () => [
      { type: 'cash', title: t('cash') },
      { type: 'mobile', title: t('mobile') },
      ...paymentTypes,
    ],
    [paymentTypes, t],
  );

  return (
    <SyncSettingSection title={t('Payments')}>
      <SyncConfigPaymentAccountField
        control={control}
        name={'defaultPayment.accountId' as FieldPath<TFieldValues>}
        label={t('default-payment-account')}
        currency={currency}
      />
      <SyncConfigPaymentAccountField
        control={control}
        name={'defaultNegPayment.accountId' as FieldPath<TFieldValues>}
        label={t('default-neg-payment-account')}
        currency={currency}
      />
      {paymentList.map((ptype) => (
        <SyncConfigPaymentAccountField
          control={control}
          key={`${paymentKey}-${ptype.type}`}
          name={`payments.${ptype.type}.accountId` as FieldPath<TFieldValues>}
          label={ptype.title}
          currency={currency}
        />
      ))}
    </SyncSettingSection>
  );
};

type VatCtaxSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

const SelectVatItem = (props: VatCtaxSelectProps) => <SelectVat {...props} />;

const SelectCtaxItem = (props: VatCtaxSelectProps) => <SelectCtax {...props} />;

const VatCtaxItem = <TFieldValues extends FieldValues & ISyncVatCtaxFields>({
  control,
  hasName,
  rowIdName,
  hasLabel,
  rowLabel,
  reverseLabel,
  selectComponent,
  kind,
}: {
  control: Control<TFieldValues>;
  hasName: FieldPath<TFieldValues>;
  rowIdName: FieldPath<TFieldValues>;
  hasLabel: string;
  rowLabel: string;
  reverseLabel: string;
  selectComponent: (props: VatCtaxSelectProps) => JSX.Element;
  kind: 'vat' | 'ctax';
}) => {
  const { t } = useTranslation('accounting');
  const hasValue = useWatch({ control, name: hasName });

  return (
    <div className="flex flex-col gap-1">
      <Form.Field
        control={control}
        name={hasName}
        render={({ field }) => (
          <PanelFormRow label={t(hasLabel)}>
            <SettingsPanelSwitch
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      {hasValue ? (
        <Form.Field
          control={control}
          name={rowIdName}
          render={({ field }) => {
            const SelectComponent = selectComponent;
            return (
              <PanelFormRow label={t(rowLabel)}>
                <SelectComponent
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            );
          }}
        />
      ) : (
        <FormSelectEbarimtProductRule
          name={
            `reverse${
              kind === 'vat' ? 'Vat' : 'Ctax'
            }Rules` as FieldPath<TFieldValues>
          }
          label={t(reverseLabel)}
          kind={kind}
          control={control}
        />
      )}
    </div>
  );
};

export const SyncConfigVatCtaxSection = <
  TFieldValues extends FieldValues & ISyncVatCtaxFields,
>({
  control,
}: {
  control: Control<TFieldValues>;
}) => (
  <section className="flex flex-col gap-1 pt-3">
    <VatCtaxItem
      control={control}
      hasName={'hasVat' as FieldPath<TFieldValues>}
      rowIdName={'vatRowId' as FieldPath<TFieldValues>}
      hasLabel="has-vat"
      rowLabel="vat-row"
      reverseLabel="reverse-vat-rules"
      selectComponent={SelectVatItem}
      kind="vat"
    />
    <VatCtaxItem
      control={control}
      hasName={'hasCtax' as FieldPath<TFieldValues>}
      rowIdName={'ctaxRowId' as FieldPath<TFieldValues>}
      hasLabel="has-ctax"
      rowLabel="ctax-row"
      reverseLabel="reverse-ctax-rules"
      selectComponent={SelectCtaxItem}
      kind="ctax"
    />
  </section>
);

export const SyncConfigFormFooter = ({
  loading,
  onCancel,
}: {
  loading: boolean;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Button type="submit" size="sm" disabled={loading}>
        {loading && <Spinner size="sm" />}
        {t('save')}
      </Button>
    </div>
  );
};
