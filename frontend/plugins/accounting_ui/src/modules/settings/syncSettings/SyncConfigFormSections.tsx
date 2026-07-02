import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SelectCtax } from '@/settings/ctax/components/SelectCtaxRow';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { TR_STATUS_OPTIONS } from '@/transactions/types/constants';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { useEffect, useMemo, useRef } from 'react';
import {
  FieldPath,
  UseFormReturn,
  useWatch,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectBranches,
  SelectDepartments,
  SelectBoard,
  SelectPipeline,
  SelectStage,
} from 'ui-modules';
import { FormSelectEbarimtProductRule } from './SelectEbarimtProductRule';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';
import { SyncSettingSection } from './SyncSettingSection';

export interface IUsePipelineResetForm {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
}

/** board/pipeline changed ued pipeline/stage reset hiih */
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

/** normalize rule IDs to array. */
export const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

/** normalize VAT/CTax fields before submit. */
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
  vatRowId: data.hasVat ? (data.vatRowId ?? '') : '',
  reverseVatRules:
    mongolianEnabled && !data.hasVat
      ? normalizeRuleIds(data.reverseVatRules)
      : [],
  ctaxRowId: data.hasCtax ? (data.ctaxRowId ?? '') : '',
  reverseCtaxRules:
    !mongolianEnabled || data.hasCtax
      ? []
      : normalizeRuleIds(data.reverseCtaxRules),
});

/** sync config form iin payment account field */
export const SyncConfigPaymentAccountField = ({
  name,
  label,
  currency,
}: {
  name: string;
  label: string;
  currency?: string;
}) => {
  const { control } = useFormContext();
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

/** return type select field bn */
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

/** return type select field. */
export const SyncConfigReturnTypeField = () => {
  const { t } = useTranslation('accounting');
  const { control } = useFormContext();

  return (
    <Form.Field
      control={control}
      name="returnType"
      render={({ field }) => <ReturnTypeFieldContent field={field} t={t} />}
    />
  );
};

/** date rule select field. */
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

/** transaction status select field. */
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

/** general fields (title, dateRule, trStatus) bn */
export const SyncConfigGeneralFields = () => {
  const { t } = useTranslation('accounting');
  const { control } = useFormContext();

  return (
    <>
      <Form.Field
        control={control}
        name="title"
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
        name="dateRule"
        render={({ field }) => <DateRuleFieldContent field={field} t={t} />}
      />
      <Form.Field
        control={control}
        name="trStatus"
        render={({ field }) => <TrStatusFieldContent field={field} t={t} />}
      />
    </>
  );
};

/** pipeline/stage selection section bn */
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

/** accounts section sale account branch department bn */
export const SyncConfigAccountsSection = () => {
  const { t } = useTranslation('accounting');
  const { control } = useFormContext();

  return (
    <SyncSettingSection title={t('accounts')}>
      <Form.Field
        control={control}
        name="saleAccountId"
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
        name="saleOutAccountId"
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
        name="saleCostAccountId"
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
        name="branchId"
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
        name="departmentId"
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

/** payment account iin payments section bn */
export const SyncConfigPaymentsSection = ({
  paymentTypes,
  paymentKey,
  currency,
}: {
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
        name="defaultPayment.accountId"
        label={t('default-payment-account')}
        currency={currency}
      />
      <SyncConfigPaymentAccountField
        name="defaultNegPayment.accountId"
        label={t('default-neg-payment-account')}
        currency={currency}
      />
      {paymentList.map((ptype) => (
        <SyncConfigPaymentAccountField
          key={`${paymentKey}-${ptype.type}`}
          name={`payments.${ptype.type}.accountId`}
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

/** VAT row selector adapter for sync config tax fields. */
const SelectVatItem = (props: VatCtaxSelectProps) => <SelectVat {...props} />;

/** CTax row selector adapter for sync config tax fields. */
const SelectCtaxItem = (props: VatCtaxSelectProps) => <SelectCtax {...props} />;

/** single VAT or CTAX toggle + conditional select/rule section. */
const VatCtaxItem = ({
  hasName,
  rowIdName,
  hasLabel,
  rowLabel,
  reverseLabel,
  selectComponent,
  kind,
}: {
  hasName: string;
  rowIdName: string;
  hasLabel: string;
  rowLabel: string;
  reverseLabel: string;
  selectComponent: (props: VatCtaxSelectProps) => JSX.Element;
  kind: 'vat' | 'ctax';
}) => {
  const { t } = useTranslation('accounting');
  const { control } = useFormContext();
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
            name={`reverse${kind === 'vat' ? 'Vat' : 'Ctax'}Rules`}
            label={t(reverseLabel)}
            kind={kind}
            control={control}
          />
        )}
      </div>
    </div>
  );
};

/** VAT/CTax toggle selection section bn */
export const SyncConfigVatCtaxSection = () => (
  <section className="col-span-full grid grid-cols-2 gap-8 mt-4 items-start">
    <VatCtaxItem
      hasName="hasVat"
      rowIdName="vatRowId"
      hasLabel="has-vat"
      rowLabel="vat-row"
      reverseLabel="reverse-vat-rules"
      selectComponent={SelectVatItem}
      kind="vat"
    />
    <VatCtaxItem
      hasName="hasCtax"
      rowIdName="ctaxRowId"
      hasLabel="has-ctax"
      rowLabel="ctax-row"
      reverseLabel="reverse-ctax-rules"
      selectComponent={SelectCtaxItem}
      kind="ctax"
    />
  </section>
);

/** sync config form iin footer cancel/save bn */
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
