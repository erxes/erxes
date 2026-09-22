import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
} from 'erxes-ui';
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
  SelectBoard,
  SelectBranches,
  SelectDepartments,
  SelectPipeline,
  SelectStage,
} from 'ui-modules';
import { useEffect, useMemo, useRef } from 'react';

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
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <SelectAccount.FormItem
              value={field.value}
              onValueChange={field.onChange}
              defaultFilter={{
                journals: [
                  JournalEnum.BANK,
                  JournalEnum.CASH,
                  JournalEnum.DEBT,
                ],
                ...(currency ? { currency } : {}),
              }}
            />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

const ReturnTypeFieldContent = ({
  field,
  t,
}: {
  field: { value: string; onChange: (v: string) => void };
  t: (s: string) => string;
}) => {
  const options = (
    <Select.Content>
      <Select.Item value="fullTr">{t('full-tr')}</Select.Item>
      <Select.Item value="onlySale">{t('only-sale')}</Select.Item>
      <Select.Item value="delete">{t('delete')}</Select.Item>
    </Select.Content>
  );

  return (
    <Form.Item>
      <Form.Label>{t('return-type')}</Form.Label>
      <Form.Control>
        <Select {...field} onValueChange={field.onChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          {options}
        </Select>
      </Form.Control>
    </Form.Item>
  );
};

export const SyncConfigReturnTypeField = <
  TFieldValues extends FieldValues & ISyncReturnTypeFields,
>({
  control,
}: {
  control: Control<TFieldValues>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <Form.Field
      control={control}
      name={'returnType' as FieldPath<TFieldValues>}
      render={({ field }) => <ReturnTypeFieldContent field={field} t={t} />}
    />
  );
};

const DateRuleFieldContent = ({
  field,
  t,
}: {
  field: { value: string; onChange: (v: string) => void };
  t: (s: string) => string;
}) => {
  const options = (
    <Select.Content>
      <Select.Item value="alwaysNow">{t('always-now')}</Select.Item>
      <Select.Item value="syncedDateOrNow">
        {t('synced-date-or-now')}
      </Select.Item>
    </Select.Content>
  );

  return (
    <Form.Item>
      <Form.Label>{t('date-rule')}</Form.Label>
      <Form.Control>
        <Select {...field} onValueChange={field.onChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          {options}
        </Select>
      </Form.Control>
    </Form.Item>
  );
};

const TrStatusFieldContent = ({
  field,
  t,
}: {
  field: { value: string; onChange: (v: string) => void };
  t: (s: string) => string;
}) => (
  <Form.Item>
    <Form.Label>{t('tr-status-label')}</Form.Label>
    <Form.Control>
      <Select {...field} onValueChange={field.onChange}>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {TR_STATUS_OPTIONS.map((s) => (
            <Select.Item key={s.value} value={s.value}>
              {s.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Form.Control>
  </Form.Item>
);

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
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('title')}</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={'dateRule' as FieldPath<TFieldValues>}
        render={({ field }) => <DateRuleFieldContent field={field} t={t} />}
      />
      <Form.Field
        control={control}
        name={'trStatus' as FieldPath<TFieldValues>}
        render={({ field }) => <TrStatusFieldContent field={field} t={t} />}
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
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('board')}</Form.Label>
            <SelectBoard.FormItem
              mode="single"
              value={field.value}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={'pipelineId' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('pipeline')}</Form.Label>
            <SelectPipeline.FormItem
              mode="single"
              value={field.value}
              boardId={boardId || undefined}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={'stageId' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('stage')}</Form.Label>
            <SelectStage.FormItem
              mode="single"
              value={field.value}
              pipelineId={pipelineId || undefined}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
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
          <Form.Item>
            <Form.Label>{t('sale-account')}</Form.Label>
            <Form.Control>
              <SelectAccount.FormItem
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={'saleOutAccountId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('sale-out-account')}</Form.Label>
            <Form.Control>
              <SelectAccount.FormItem
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={'saleCostAccountId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('sale-cost-account')}</Form.Label>
            <Form.Control>
              <SelectAccount.FormItem
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={'branchId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('branch')}</Form.Label>
            <Form.Control>
              <SelectBranches.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={'departmentId' as FieldPath<TFieldValues>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('department')}</Form.Label>
            <Form.Control>
              <SelectDepartments.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
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
      { type: 'cash', title: 'cash' },
      { type: 'mobile', title: 'mobile' },
      ...paymentTypes,
    ],
    [paymentTypes],
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
    <div className="flex flex-col gap-4">
      <Form.Field
        control={control}
        name={hasName}
        render={({ field }) => (
          <Form.Item className="flex items-center gap-2 space-y-0">
            <Form.Control>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Label variant="peer">{t(hasLabel)}</Form.Label>
          </Form.Item>
        )}
      />
      <div>
        {hasValue ? (
          <Form.Field
            control={control}
            name={rowIdName}
            render={({ field }) => {
              const SelectComponent = selectComponent;
              return (
                <Form.Item>
                  <Form.Label>{t(rowLabel)}</Form.Label>
                  <Form.Control>
                    <SelectComponent
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
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
  <section className="col-span-full grid grid-cols-2 gap-8 mt-4 items-start">
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

export const SyncConfigFormFooter = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation('accounting');

  return (
    <Sheet.Footer className="px-5 py-4 border-t bg-background shrink-0 gap-2">
      <Sheet.Close asChild>
        <Button variant="outline" size="lg">
          {t('cancel')}
        </Button>
      </Sheet.Close>
      <Button type="submit" disabled={loading} size="lg">
        {loading ? <Spinner /> : t('save')}
      </Button>
    </Sheet.Footer>
  );
};
