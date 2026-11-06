import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  Select,
  Sheet,
  Skeleton,
  Table,
} from 'erxes-ui';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { JournalEnum } from '@/settings/account/types/Account';
import { ITrDetail } from '@/transactions/types/Transaction';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { AccountField } from '@/transactions/transaction-form/components/GeneralFormFields';
import { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import { FixedAssetChooser } from '@/settings/fixed-assets/components/chooser/FixedAssetChooser';
import { TChooserLocation } from '@/settings/fixed-assets/components/chooser/types';
import { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import {
  FxaChangeMethodField,
  FxaChangeNumberField,
} from '@/transactions/transaction-form/components/forms/FxaChangeFields';

export const FxaChangeRow = ({
  form,
  index,
  detailIndex,
  detail,
  capital,
  onAssetChange,
  onRemove,
  onValuationChange,
  depreciationAccounts,
}: {
  form: ITransactionGroupForm;
  index: number;
  detailIndex: number;
  detail: ITrDetail;
  capital: boolean;
  onAssetChange: (
    assetId: string,
    accountId: string,
    location?: TChooserLocation,
  ) => boolean;
  onRemove: () => void;
  onValuationChange: (
    assetId: string,
    valuation?: TFxaCapitalValuation,
  ) => void;
  depreciationAccounts: Map<string, string>;
}) => {
  const { t } = useTranslation('accounting');
  const date = useWatch({ control: form.control, name: 'date' });
  const trDoc = useWatch({ control: form.control, name: `trDocs.${index}` });
  const assetId = detail.fixedAssetId || '';
  const [pendingAsset, setPendingAsset] = useState(
    capital && !detail.followInfos?.originalCost ? assetId : '',
  );
  const { data, loading, error } = useQuery(FXA_CAPITAL_VALUATION, {
    variables: {
      fixedAssetId: assetId,
      date,
      excludeTransactionId: trDoc?.parentId ? trDoc._id : undefined,
    },
    skip: !capital || !assetId || !date,
    fetchPolicy: 'network-only',
  });
  const valuation =
    loading || error ? undefined : data?.fixedAssetCapitalValuation;
  useEffect(() => {
    if (!capital || !assetId) return;
    onValuationChange(assetId, valuation);
    return () => onValuationChange(assetId, undefined);
  }, [assetId, capital, onValuationChange, valuation]);
  useEffect(() => {
    if (
      !capital ||
      !pendingAsset ||
      valuation?.fixedAssetId !== pendingAsset ||
      assetId !== pendingAsset
    )
      return;
    form.setValue(
      `trDocs.${index}.details.${detailIndex}.accountId`,
      valuation.accountId,
    );
    form.setValue(`trDocs.${index}.details.${detailIndex}.followInfos`, {
      capitalizationType: 'improvement',
      originalCost: valuation.originalCost,
      annualDepreciationRate: valuation.annualDepreciationRate,
      depreciationMethod: valuation.depreciationMethod,
      preDeprecation: valuation.preDeprecation,
      salvageValue: valuation.salvageValue,
    });
    setPendingAsset('');
  }, [assetId, capital, detailIndex, form, index, pendingAsset, valuation]);
  const fieldProps = { form, index, detailIndex };
  const message =
    error?.message ||
    (valuation && !valuation.ready
      ? t('fxa-capital-needs-depreciation')
      : valuation && valuation.count <= 0
      ? t('fxa-capital-no-quantity')
      : '');
  return (
    <Table.Row className="overflow-hidden h-cell hover:bg-background!">
      <Table.Cell className="w-8 p-0">
        <Sheet>
          <Sheet.Trigger asChild>
            <RecordTable.MoreButton
              className="h-8 w-8 p-0"
              type="button"
              aria-label={t(
                capital ? 'fxa-capital-details' : 'fxa-correction-details',
              )}
              title={t(
                capital ? 'fxa-capital-details' : 'fxa-correction-details',
              )}
            />
          </Sheet.Trigger>
          <Sheet.View className="flex flex-col gap-0 p-0 sm:max-w-2xl">
            <Sheet.Header className="h-auto py-2">
              <Sheet.Title>
                {t(capital ? 'fxa-capital-details' : 'fxa-correction-details')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="space-y-5 overflow-auto p-4">
              <SelectFixedAsset.Provider value={assetId}>
                <SelectFixedAsset.Value />
              </SelectFixedAsset.Provider>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {capital && (
                  <Form.Field
                    control={form.control}
                    name={`trDocs.${index}.details.${detailIndex}.followInfos.capitalizationType`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('fxa-capital-type')}</Form.Label>
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
                              {t('fxa-improvement')}
                            </Select.Item>
                            <Select.Item value="revaluation">
                              {t('fxa-revaluation')}
                            </Select.Item>
                          </Select.Content>
                        </Select>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
                {capital && (
                  <FxaChangeNumberField
                    {...fieldProps}
                    rule="preDeprecation"
                    label="fxa-new-unit-depreciation"
                  />
                )}
                <FxaChangeNumberField
                  {...fieldProps}
                  rule="salvageValue"
                  label="fxa-unit-salvage-value"
                />
                <FxaChangeMethodField {...fieldProps} capital={capital} />
                {!capital && (
                  <AccountField
                    form={form}
                    index={index}
                    detIndex={detailIndex}
                    labelTxt="accumulated-depreciation-account"
                    filter={{ journals: [JournalEnum.FXA_FOLLOW] }}
                  />
                )}
                {!capital && (
                  <Form.Field
                    control={form.control}
                    name={`trDocs.${index}.details.${detailIndex}.followInfos.depreciationStartDate`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('depreciation-start-date')}</Form.Label>
                        <Form.Control>
                          <Input
                            type="date"
                            value={field.value?.slice(0, 10) || ''}
                            onChange={(event) =>
                              field.onChange(event.target.value || undefined)
                            }
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </div>
              {!capital && (
                <p className="text-sm text-muted-foreground">
                  {t('fxa-blank-rules-help')}
                </p>
              )}
              {valuation && (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <dt>{t('quantity')}</dt>
                  <dd>{valuation.count}</dd>
                  <dt>{t('fxa-old-unit-cost')}</dt>
                  <dd>{valuation.originalCost.toLocaleString()}</dd>
                  <dt>{t('fxa-old-unit-depreciation')}</dt>
                  <dd>{valuation.preDeprecation.toLocaleString()}</dd>
                  <dt>{t('fxa-new-unit-book-value')}</dt>
                  <dd>
                    {(
                      (detail.followInfos?.originalCost || 0) -
                      (detail.followInfos?.preDeprecation ??
                        valuation.preDeprecation)
                    ).toLocaleString()}
                  </dd>
                </dl>
              )}
              {message && (
                <p role="alert" className="text-sm text-destructive">
                  {message}
                </p>
              )}
            </Sheet.Content>
          </Sheet.View>
        </Sheet>
      </Table.Cell>
      <Table.Cell className="min-w-64">
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.details.${detailIndex}.fixedAssetId`}
          render={({ field }) => (
            <Form.Item>
              <FixedAssetChooser
                journal={trDoc?.journal || ''}
                date={date}
                value={field.value || ''}
                branchId={detail.branchId || trDoc?.branchId || ''}
                departmentId={detail.departmentId || trDoc?.departmentId || ''}
                excludeTransactionId={trDoc?._id}
                allLocations={capital}
                onChoose={(choices) => {
                  const choice = choices[0];
                  if (!choice?.asset._id) return false;
                  const accountId = capital
                    ? choice.asset.accountId || ''
                    : depreciationAccounts.get(choice.asset.accountId || '') ||
                      '';
                  if (
                    !onAssetChange(choice.asset._id, accountId, choice.location)
                  )
                    return false;
                  if (capital) setPendingAsset(choice.asset._id);
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        {message && (
          <p role="alert" className="text-xs text-destructive">
            {message}
          </p>
        )}
      </Table.Cell>
      {capital && (
        <Table.Cell className="tabular-nums">
          <RecordTableInlineCell>
            {loading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              valuation?.originalCost.toLocaleString() || '-'
            )}
          </RecordTableInlineCell>
        </Table.Cell>
      )}
      <Table.Cell>
        {capital ? (
          <FxaChangeNumberField
            {...fieldProps}
            rule="originalCost"
            label="fxa-new-unit-cost"
            compact
          />
        ) : (
          <Form.Field
            control={form.control}
            name={`trDocs.${index}.details.${detailIndex}.amount`}
            render={({ field }) => (
              <Form.Item>
                <PopoverScoped
                  scope={`trDocs.${index}.details.${detailIndex}.amount`}
                  closeOnEnter
                >
                  <Form.Control>
                    <RecordTableInlineCell.Trigger
                      aria-label={t('fxa-correction-amount')}
                    >
                      {(field.value ?? 0).toLocaleString()}
                    </RecordTableInlineCell.Trigger>
                  </Form.Control>
                  <RecordTableInlineCell.Content>
                    <Input
                      type="number"
                      aria-label={t('fxa-correction-amount')}
                      min={0}
                      step="any"
                      value={field.value ?? 0}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </RecordTableInlineCell.Content>
                </PopoverScoped>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </Table.Cell>
      <Table.Cell>
        <FxaChangeNumberField
          {...fieldProps}
          rule="annualDepreciationRate"
          label={capital ? 'fxa-new-useful-years' : 'annual-depreciation-rate'}
          compact
          usefulYears={capital}
        />
      </Table.Cell>
      {capital && (
        <Table.Cell className="tabular-nums">
          <RecordTableInlineCell>
            {valuation
              ? (
                  ((detail.followInfos?.originalCost || 0) -
                    valuation.originalCost) *
                  valuation.count
                ).toLocaleString()
              : '-'}
          </RecordTableInlineCell>
        </Table.Cell>
      )}
      <Table.Cell className="w-8 p-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          aria-label={t('fxa-remove-row')}
          title={t('fxa-remove-row')}
          onClick={onRemove}
        >
          <IconTrash className="size-4" />
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};
