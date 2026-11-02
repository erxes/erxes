import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, Skeleton } from 'erxes-ui';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/settings/fixed-assets/constants/depreciationMethods';
import {
  getRateFromUsefulLife,
  getUsefulLifeFromRate,
} from '@/settings/fixed-assets/utils/depreciationRate';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { DescriptionField } from '@/transactions/transaction-form/components/GeneralFormFields';
import { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import { useFxaCapitalPreview } from '@/transactions/transaction-form/components/forms/hooks/useFxaCapitalPreview';

const numberFields = [
  { key: 'originalCost', label: 'Шинэ нэгжийн анхны өртөг' },
  { key: 'preDeprecation', label: 'Шинэ нэгжийн хуримтлагдсан элэгдэл' },
  { key: 'salvageValue', label: 'Нэгжийн үлдэх өртөг' },
] as const;

export const FxaCapitalForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const { t } = useTranslation('accounting');
  const [pendingAsset, setPendingAsset] = useState('');
  const trDoc = useWatch({ control: form.control, name: `trDocs.${index}` });
  const date = useWatch({ control: form.control, name: 'date' });
  const fixedAssetId = trDoc?.details?.[0]?.fixedAssetId || '';
  const { data, loading, error } = useQuery(FXA_CAPITAL_VALUATION, {
    variables: {
      fixedAssetId,
      date,
      excludeTransactionId: trDoc?.parentId ? trDoc._id : undefined,
    },
    skip: !fixedAssetId || !date,
    fetchPolicy: 'network-only',
  });
  const valuation =
    loading || error ? undefined : data?.fixedAssetCapitalValuation;
  useEffect(() => {
    if (
      !pendingAsset ||
      valuation?.fixedAssetId !== pendingAsset ||
      fixedAssetId !== pendingAsset
    )
      return;
    form.setValue(`trDocs.${index}.details.0.accountId`, valuation.accountId);
    form.setValue(`trDocs.${index}.details.0.followInfos`, {
      capitalizationType: 'improvement',
      originalCost: valuation.originalCost,
      annualDepreciationRate: valuation.annualDepreciationRate,
      depreciationMethod: valuation.depreciationMethod,
      preDeprecation: valuation.preDeprecation,
      salvageValue: valuation.salvageValue,
    });
    setPendingAsset('');
  }, [fixedAssetId, form, index, pendingAsset, valuation]);
  useFxaCapitalPreview({ form, index, trDoc, valuation });
  if (trDoc?.journal !== 'fxaCapital') return null;
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {t('fxa-capital-help', {
          defaultValue:
            'Засвар, шинэчлэл эсвэл дахин үнэлгээний огнооноос өртөг болон элэгдлийн шинэ хугацаа үйлчилнэ. Тоо хэмжээ өөрчлөгдөхгүй. Шинэ үлдэгдэл өртгийг оруулсан ашиглах хугацаанд элэгдүүлнэ. Өмнөх өдөр хүртэлх элэгдлийг эхлээд бодож, гүйлгээг үүсгэсэн байна.',
        })}
      </p>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.details.0.fixedAssetId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('fixed-asset')}</Form.Label>
              <SelectFixedAsset.FormItem
                value={field.value || ''}
                onValueChange={(value) => {
                  if (typeof value !== 'string') return;
                  const first = form.getValues(`trDocs.${index}.details.0`);
                  form.setValue(`trDocs.${index}.details`, [
                    {
                      ...first,
                      account: undefined,
                      fixedAssetId: value,
                      accountId: '',
                      count: 0,
                      amount: 0,
                      followInfos: {
                        capitalizationType: 'improvement',
                        originalCost: 0,
                        annualDepreciationRate: 0,
                      },
                    },
                  ]);
                  setPendingAsset(value);
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.details.0.followInfos.capitalizationType`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('fxa-capital-type', {
                  defaultValue: 'Капиталжуулалтын төрөл',
                })}
              </Form.Label>
              <Select
                value={field.value || 'improvement'}
                onValueChange={field.onChange}
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="improvement">
                    {t('fxa-improvement', {
                      defaultValue: 'Засвар / шинэчлэл',
                    })}
                  </Select.Item>
                  <Select.Item value="revaluation">
                    {t('fxa-revaluation', { defaultValue: 'Дахин үнэлгээ' })}
                  </Select.Item>
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.followInfos.capitalAccountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('fxa-capital-account', { defaultValue: 'Эсрэг данс' })}
              </Form.Label>
              <SelectAccount
                value={field.value || ''}
                onValueChange={field.onChange}
                defaultFilter={{
                  journals: [JournalEnum.MAIN],
                  permissionMode: 'write',
                  status: 'active',
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        {numberFields.map(({ key, label }) => (
          <Form.Field
            key={key}
            control={form.control}
            name={`trDocs.${index}.details.0.followInfos.${key}`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t(label)}</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ''
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        ))}
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.details.0.followInfos.annualDepreciationRate`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('fxa-new-useful-years', {
                  defaultValue: 'Шинэ ашиглах хугацаа (жил)',
                })}
              </Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  value={getUsefulLifeFromRate(field.value) ?? ''}
                  onChange={(event) =>
                    field.onChange(
                      getRateFromUsefulLife(Number(event.target.value)) || 0,
                    )
                  }
                />
              </Form.Control>
              <Form.Description>
                {t('annual-depreciation-rate')}: {field.value || 0}%
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.details.0.followInfos.depreciationMethod`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('depreciation-method')}</Form.Label>
              <Select
                value={field.value || 'straightLine'}
                onValueChange={field.onChange}
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {FIXED_ASSET_DEPRECIATION_METHODS.filter(
                    (method) => method.value !== 'manual',
                  ).map((method) => (
                    <Select.Item key={method.value} value={method.value}>
                      {t(method.label)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <DescriptionField form={form} index={index} />
      </div>
      {loading && <Skeleton className="h-20 w-full" />}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      {valuation && (
        <div className="rounded border p-4 text-sm space-y-2">
          <div>
            {t('quantity')}: {valuation.count}
          </div>
          <div>
            {t('fxa-old-unit-cost', { defaultValue: 'Өмнөх нэгжийн өртөг' })}:{' '}
            {valuation.originalCost.toLocaleString()}
          </div>
          <div>
            {t('fxa-old-unit-depreciation', {
              defaultValue: 'Өмнөх нэгжийн хуримтлагдсан элэгдэл',
            })}
            : {valuation.preDeprecation.toLocaleString()}
          </div>
          <div>
            {t('fxa-capital-total', {
              defaultValue: 'Өртгийн өөрчлөлтийн нийт дүн',
            })}
            :{' '}
            {trDoc.details
              .reduce((sum, row) => sum + row.amount, 0)
              .toLocaleString()}
          </div>
          <div>
            {t('fxa-new-unit-book-value', {
              defaultValue: 'Шинэ нэгжийн үлдэгдэл өртөг',
            })}
            :{' '}
            {(
              (trDoc.details[0]?.followInfos.originalCost || 0) -
              (trDoc.details[0]?.followInfos.preDeprecation ??
                valuation.preDeprecation)
            ).toLocaleString()}
          </div>
          {!valuation.ready && (
            <p role="alert" className="text-destructive">
              {t('fxa-capital-needs-depreciation', {
                defaultValue:
                  'Капиталжуулалтын өмнөх өдөр хүртэл элэгдлээ бодож, гүйлгээг үүсгэнэ үү.',
              })}
            </p>
          )}
          {valuation.count <= 0 && (
            <p role="alert" className="text-destructive">
              {t('fxa-capital-no-quantity', {
                defaultValue: 'Энэ хөрөнгийн үлдэгдэл тоо байхгүй байна.',
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
