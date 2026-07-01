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
import { useMemo } from 'react';
import { UseFormReturn, useWatch, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments, SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { FormSelectEbarimtProductRule } from './SelectEbarimtProductRule';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';
import { SyncSettingSection } from './SyncSettingSection';

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
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('date-rule')}</Form.Label>
            <Form.Control>
              <Select {...field} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="alwaysNow">{t('always-now')}</Select.Item>
                  <Select.Item value="syncedDateOrNow">
                    {t('synced-date-or-now')}
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="trStatus"
        render={({ field }) => (
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
        )}
      />
    </>
  );
};

export const SyncConfigPipelineSection = ({
  boardId,
  pipelineId,
  form,
}: {
  boardId?: string;
  pipelineId?: string;
  form: UseFormReturn<any>;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SyncSettingSection title={t('pipeline')}>
      <Form.Field
        control={form.control}
        name="boardId"
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
        name="pipelineId"
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
        name="stageId"
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

export const SyncConfigPaymentsSection = ({
  paymentTypes,
  paymentKey,
}: {
  paymentTypes: any[];
  paymentKey: string;
}) => {
  const { t } = useTranslation('accounting');
  const { control } = useFormContext();

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
      <Form.Field
        control={control}
        name="defaultPayment.accountId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('default-payment-account')}</Form.Label>
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
                }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="defaultNegPayment.accountId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('default-neg-payment-account')}</Form.Label>
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
                }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      {paymentList.map((ptype) => (
        <Form.Field
          key={`${paymentKey}-${ptype.type}`}
          control={control}
          name={`payments.${ptype.type}.accountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{ptype.title}</Form.Label>
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
                  }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      ))}
    </SyncSettingSection>
  );
};

export const SyncConfigVatCtaxSection = () => {
  const { t } = useTranslation('accounting');
  const { control } = useFormContext();

  return (
    <section className="col-span-full grid grid-cols-2 gap-8 mt-4 items-start">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={control}
          name="hasVat"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2 space-y-0">
              <Form.Control>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label variant="peer">{t('has-vat')}</Form.Label>
            </Form.Item>
          )}
        />
        <div>
          {useWatch({ control, name: 'hasVat' }) ? (
            <Form.Field
              control={control}
              name="vatRowId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('vat-row')}</Form.Label>
                  <Form.Control>
                    <SelectVat
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          ) : (
            <FormSelectEbarimtProductRule
              name="reverseVatRules"
              label={t('reverse-vat-rules')}
              kind="vat"
              control={control}
            />
          )}
        </div>
      </div>
      <div className="flex-col flex gap-4">
        <Form.Field
          control={control}
          name="hasCtax"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2 space-y-0">
              <Form.Control>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label variant="peer">{t('has-ctax')}</Form.Label>
            </Form.Item>
          )}
        />
        <div>
          {useWatch({ control, name: 'hasCtax' }) ? (
            <Form.Field
              control={control}
              name="ctaxRowId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('ctax-row')}</Form.Label>
                  <Form.Control>
                    <SelectCtax
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          ) : (
            <FormSelectEbarimtProductRule
              name="reverseCtaxRules"
              label={t('reverse-ctax-rules')}
              kind="ctax"
              control={control}
            />
          )}
        </div>
      </div>
    </section>
  );
};

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
