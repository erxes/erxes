import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  Skeleton,
  Table,
} from 'erxes-ui';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { ITrDetail } from '@/transactions/types/Transaction';
import { TrJournalEnum } from '@/transactions/types/constants';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import { FixedAssetChooser } from '@/settings/fixed-assets/components/chooser/FixedAssetChooser';
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
  onAssetChange,
  onRemove,
  onValuationChange,
}: {
  form: ITransactionGroupForm;
  index: number;
  detailIndex: number;
  detail: ITrDetail;
  onAssetChange: (assetId: string, accountId: string) => boolean;
  onRemove: () => void;
  onValuationChange: (
    assetId: string,
    valuation?: TFxaCapitalValuation,
  ) => void;
}) => {
  const { t } = useTranslation('accounting');
  const date = useWatch({ control: form.control, name: 'date' });
  const trDoc = useWatch({ control: form.control, name: `trDocs.${index}` });
  const revaluation = trDoc?.journal === TrJournalEnum.FXA_REVALUATION;
  const assetId = detail.fixedAssetId || '';
  const [pendingAsset, setPendingAsset] = useState(
    detail.followInfos?.originalCost === undefined ? assetId : '',
  );
  const { data, loading, error } = useQuery(FXA_CAPITAL_VALUATION, {
    variables: {
      fixedAssetId: assetId,
      date,
      journal: trDoc?.journal,
      excludeTransactionId: trDoc?.parentId ? trDoc._id : undefined,
    },
    skip: !assetId || !date,
    fetchPolicy: 'network-only',
  });
  const valuation =
    loading || error ? undefined : data?.fixedAssetCapitalValuation;
  useEffect(() => {
    if (!assetId) return;
    onValuationChange(assetId, valuation);
    return () => onValuationChange(assetId, undefined);
  }, [assetId, onValuationChange, valuation]);
  useEffect(() => {
    if (
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
      originalCost: valuation.originalCost,
      annualDepreciationRate: valuation.annualDepreciationRate,
      depreciationMethod: valuation.depreciationMethod,
      preDeprecation: valuation.preDeprecation,
      salvageValue: valuation.salvageValue,
      taxDepreciationMethod: valuation.taxDepreciationMethod || undefined,
      taxAnnualDepreciationRate:
        valuation.taxAnnualDepreciationRate ?? undefined,
      taxSalvageValue: valuation.taxSalvageValue ?? undefined,
    });
    setPendingAsset('');
  }, [assetId, detailIndex, form, index, pendingAsset, valuation]);
  const fieldProps = { form, index, detailIndex };
  const title = revaluation ? 'fxa-revaluation-details' : 'fxa-capital-details';
  let message = error?.message || '';
  if (!message && valuation) {
    if (!valuation.ready) message = t('fxa-capital-needs-depreciation');
    else if (valuation.count <= 0) message = t('fxa-capital-no-quantity');
  }
  const allocation =
    trDoc?.journal === TrJournalEnum.FXA_REVALUATION
      ? trDoc.details
          .filter((row) => row.fixedAssetId === assetId)
          .reduce(
            (sum, row) => ({
              lossRecovery:
                sum.lossRecovery +
                Math.max(-(row.followInfos?.revaluationLoss || 0), 0),
              reserveUsed:
                sum.reserveUsed +
                Math.max(-(row.followInfos?.revaluationReserve || 0), 0),
              loss:
                sum.loss + Math.max(row.followInfos?.revaluationLoss || 0, 0),
              reserve:
                sum.reserve +
                Math.max(row.followInfos?.revaluationReserve || 0, 0),
            }),
            { lossRecovery: 0, reserveUsed: 0, loss: 0, reserve: 0 },
          )
      : undefined;
  return (
    <Table.Row className="overflow-hidden h-cell hover:bg-background!">
      <Table.Cell className="w-8 p-0">
        <Sheet>
          <Sheet.Trigger asChild>
            <RecordTable.MoreButton
              className="h-8 w-8 p-0"
              type="button"
              aria-label={t(title)}
              title={t(title)}
            />
          </Sheet.Trigger>
          <Sheet.View className="flex flex-col gap-0 p-0 sm:max-w-2xl">
            <Sheet.Header className="h-auto py-2">
              <Sheet.Title>{t(title)}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="space-y-5 overflow-auto p-4">
              <SelectFixedAsset.Provider value={assetId}>
                <SelectFixedAsset.Value />
              </SelectFixedAsset.Provider>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FxaChangeNumberField
                  {...fieldProps}
                  rule="preDeprecation"
                  label="fxa-new-unit-depreciation"
                />
                <FxaChangeNumberField
                  {...fieldProps}
                  rule="salvageValue"
                  label="fxa-unit-salvage-value"
                />
                <FxaChangeMethodField {...fieldProps} capital />
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
              </div>
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
                  {revaluation && (
                    <>
                      <dt>{t('fxa-revaluation-loss-balance')}</dt>
                      <dd>{valuation.revaluationLoss.toLocaleString()}</dd>
                      <dt>{t('fxa-revaluation-reserve-balance')}</dt>
                      <dd>{valuation.revaluationReserve.toLocaleString()}</dd>
                    </>
                  )}
                </dl>
              )}
              {revaluation && allocation && (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <dt>{t('fxa-revaluation-loss-recovery')}</dt>
                  <dd>{allocation.lossRecovery.toLocaleString()}</dd>
                  <dt>{t('fxa-revaluation-reserve-used')}</dt>
                  <dd>{allocation.reserveUsed.toLocaleString()}</dd>
                  <dt>{t('fxa-revaluation-new-loss')}</dt>
                  <dd>{allocation.loss.toLocaleString()}</dd>
                  <dt>{t('fxa-revaluation-new-reserve')}</dt>
                  <dd>{allocation.reserve.toLocaleString()}</dd>
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
                allLocations
                onChoose={(choices) => {
                  const choice = choices[0];
                  if (
                    !choice?.asset._id ||
                    !onAssetChange(
                      choice.asset._id,
                      choice.asset.accountId || '',
                    )
                  )
                    return false;
                  setPendingAsset(choice.asset._id);
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
      <Table.Cell className="tabular-nums">
        <RecordTableInlineCell>
          {loading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            valuation?.originalCost.toLocaleString() || '-'
          )}
        </RecordTableInlineCell>
      </Table.Cell>
      <Table.Cell>
        <FxaChangeNumberField
          {...fieldProps}
          rule="originalCost"
          label="fxa-new-unit-cost"
          compact
        />
      </Table.Cell>
      <Table.Cell>
        <FxaChangeNumberField
          {...fieldProps}
          rule="annualDepreciationRate"
          label="fxa-new-useful-years"
          compact
          usefulYears
        />
      </Table.Cell>
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
