import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { Button, ScrollArea, Table, toast } from 'erxes-ui';
import { SelectFixedAssetsBulk } from '@/settings/fixed-assets/components/SelectFixedAssetsBulk';
import { useFixedAssetAccountConfigs } from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import { TrJournalEnum } from '@/transactions/types/constants';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import {
  BranchField,
  DepartmentField,
  DescriptionField,
  SideField,
} from '@/transactions/transaction-form/components/GeneralFormFields';
import {
  fxaCapitalDetailDefaultValues,
  fxaJustifyDetailDefaultValues,
} from '@/transactions/transaction-form/contants/defaultValues';
import { useFxaCapitalPreview } from '@/transactions/transaction-form/components/forms/hooks/useFxaCapitalPreview';
import { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import { FxaChangeRow } from '@/transactions/transaction-form/components/forms/FxaChangeRow';

export const FxaChangeTable = ({
  form,
  index,
  capital,
}: {
  form: ITransactionGroupForm;
  index: number;
  capital: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const trDoc = useWatch({ control: form.control, name: `trDocs.${index}` });
  const { append, remove } = useFieldArray({
    control: form.control,
    name: `trDocs.${index}.details`,
  });
  const {
    configs,
    loading: configsLoading,
    error: configError,
  } = useFixedAssetAccountConfigs();
  const [valuationMap, setValuations] = useState<
    Record<string, TFxaCapitalValuation | undefined>
  >({});
  const onValuationChange = useCallback(
    (assetId: string, value?: TFxaCapitalValuation) => {
      setValuations((previous) =>
        previous[assetId] === value
          ? previous
          : { ...previous, [assetId]: value },
      );
    },
    [],
  );
  const valuations = useMemo(
    () =>
      Object.values(valuationMap).filter(
        (value): value is TFxaCapitalValuation => Boolean(value),
      ),
    [valuationMap],
  );
  const mixedDirections = useFxaCapitalPreview({
    form,
    index,
    trDoc,
    valuation: valuations,
  });
  const depreciationAccounts = useMemo(
    () =>
      new Map(
        configs.map((config) => [
          config.accountId,
          config.value.depreciationAccountId || '',
        ]),
      ),
    [configs],
  );
  if (
    !trDoc ||
    (trDoc.journal !== TrJournalEnum.FXA_CAPITAL &&
      trDoc.journal !== TrJournalEnum.FXA_JUSTIFY)
  )
    return null;
  const details = trDoc.details;
  const rows: { detailIndex: number; indices: number[] }[] = [];
  const byAsset = new Map<string, { detailIndex: number; indices: number[] }>();
  details.forEach((detail, detailIndex) => {
    const key = capital ? detail.fixedAssetId || detail._id : detail._id;
    const previous = byAsset.get(key);
    if (previous) previous.indices.push(detailIndex);
    else {
      const row = { detailIndex, indices: [detailIndex] };
      byAsset.set(key, row);
      rows.push(row);
    }
  });
  const makeDetail = (assetId = '', accountId = '') => {
    const detail = { fixedAssetId: assetId, accountId, unitPrice: 0 };
    return capital
      ? fxaCapitalDetailDefaultValues(detail)
      : fxaJustifyDetailDefaultValues(detail);
  };
  const addAssets = (assets: { _id: string; accountId?: string }[]) => {
    const selected = new Set(details.map((detail) => detail.fixedAssetId));
    const fresh = assets.filter((asset) => !selected.has(asset._id));
    const newDetails = fresh.map((asset) =>
      makeDetail(
        asset._id,
        capital
          ? asset.accountId || ''
          : depreciationAccounts.get(asset.accountId || '') || '',
      ),
    );
    if (newDetails.length)
      form.setValue(`trDocs.${index}.details`, [
        ...details.filter((detail) => detail.fixedAssetId),
        ...newDetails,
      ]);
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {!capital && (
          <SideField
            form={form}
            index={index}
            labelTxt="fxa-depreciation-change"
            sides={[
              { value: 'ct', label: 'fxa-increase-depreciation' },
              { value: 'dt', label: 'fxa-decrease-depreciation' },
            ]}
          />
        )}
        {!capital && <BranchField form={form} index={index} />}
        {!capital && <DepartmentField form={form} index={index} />}
        <DescriptionField form={form} index={index} />
      </div>
      <p className="text-sm text-muted-foreground">
        {t(capital ? 'fxa-capital-help' : 'fxa-correction-help')}
      </p>
      {!capital && configsLoading && (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      )}
      {!capital && configError && (
        <p role="alert" className="text-sm text-destructive">
          {configError.message}
        </p>
      )}
      {mixedDirections && (
        <p role="alert" className="text-sm text-destructive">
          {t('fxa-capital-mixed-direction')}
        </p>
      )}
      <ScrollArea className="w-full pb-3">
        <Table className="min-w-full w-max">
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-8" />
              <Table.Head>{t('fixed-asset')}</Table.Head>
              {capital && <Table.Head>{t('fxa-old-unit-cost')}</Table.Head>}
              <Table.Head>
                {t(capital ? 'fxa-new-unit-cost' : 'fxa-correction-amount')}
              </Table.Head>
              <Table.Head>
                {t(
                  capital ? 'fxa-new-useful-years' : 'annual-depreciation-rate',
                )}
              </Table.Head>
              {capital && <Table.Head>{t('fxa-capital-total')}</Table.Head>}
              <Table.Head className="w-8" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map(({ detailIndex, indices }) => {
              const detail = details[detailIndex];
              return (
                <FxaChangeRow
                  key={detail._id}
                  form={form}
                  index={index}
                  detailIndex={detailIndex}
                  detail={detail}
                  capital={capital}
                  onValuationChange={onValuationChange}
                  depreciationAccounts={depreciationAccounts}
                  onRemove={() => remove(indices)}
                  onAssetChange={(assetId, accountId) => {
                    if (
                      details.some(
                        (item, i) =>
                          !indices.includes(i) &&
                          item.fixedAssetId === assetId &&
                          assetId,
                      )
                    ) {
                      toast({
                        title: t('fxa-asset-already-selected'),
                        variant: 'destructive',
                      });
                      return;
                    }
                    const replacement = {
                      ...makeDetail(assetId, accountId),
                      _id: detail._id,
                    };
                    form.setValue(
                      `trDocs.${index}.details`,
                      details
                        .filter(
                          (_item, i) =>
                            i === detailIndex || !indices.includes(i),
                        )
                        .map((item) =>
                          item._id === detail._id ? replacement : item,
                        ),
                    );
                  }}
                />
              );
            })}
            {!rows.length && (
              <Table.Row>
                <Table.Cell
                  colSpan={capital ? 7 : 5}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t('fxa-empty-assets')}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
        <ScrollArea.Bar orientation="horizontal" />
      </ScrollArea>
      <div className="flex justify-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => append(makeDetail())}
        >
          <IconPlus className="size-4" />
          {t('new-row')}
        </Button>
        <SelectFixedAssetsBulk
          fixedAssetIds={[]}
          onSelect={(_ids, assets) => addAssets(assets)}
        >
          <Button type="button" variant="secondary">
            <IconPlus className="size-4" />
            {t('add-multiple-assets')}
          </Button>
        </SelectFixedAssetsBulk>
      </div>
    </div>
  );
};
