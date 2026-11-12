import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { Button, ScrollArea, Table, toast } from 'erxes-ui';
import { FixedAssetChooser } from '@/settings/fixed-assets/components/chooser/FixedAssetChooser';
import { TFixedAssetChoice } from '@/settings/fixed-assets/components/chooser/types';
import { TrJournalEnum } from '@/transactions/types/constants';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { DescriptionField } from '@/transactions/transaction-form/components/GeneralFormFields';
import { fxaCapitalDetailDefaultValues } from '@/transactions/transaction-form/contants/defaultValues';
import { useFxaCapitalPreview } from '@/transactions/transaction-form/components/forms/hooks/useFxaCapitalPreview';
import { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import { FxaChangeRow } from '@/transactions/transaction-form/components/forms/FxaChangeRow';

export const FxaChangeTable = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const { t } = useTranslation('accounting');
  const date = useWatch({ control: form.control, name: 'date' });
  const trDoc = useWatch({ control: form.control, name: `trDocs.${index}` });
  const { append, remove } = useFieldArray({
    control: form.control,
    name: `trDocs.${index}.details`,
  });
  const [valuationMap, setValuationMap] = useState<
    Record<string, TFxaCapitalValuation | undefined>
  >({});
  const onValuationChange = useCallback(
    (assetId: string, value?: TFxaCapitalValuation) => {
      setValuationMap((previous) =>
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
  if (
    !trDoc ||
    (trDoc.journal !== TrJournalEnum.FXA_CAPITAL &&
      trDoc.journal !== TrJournalEnum.FXA_REVALUATION)
  )
    return null;
  const details = trDoc.details;
  const rows: { detailIndex: number; indices: number[] }[] = [];
  const byAsset = new Map<string, { detailIndex: number; indices: number[] }>();
  details.forEach((detail, detailIndex) => {
    const key = detail.fixedAssetId || detail._id;
    const previous = byAsset.get(key);
    if (previous) previous.indices.push(detailIndex);
    else {
      const row = { detailIndex, indices: [detailIndex] };
      byAsset.set(key, row);
      rows.push(row);
    }
  });
  const makeDetail = (assetId = '', accountId = '') =>
    fxaCapitalDetailDefaultValues({
      fixedAssetId: assetId,
      accountId,
      unitPrice: 0,
    });
  const addAssets = (choices: TFixedAssetChoice[]) => {
    const selected = new Set(details.map((detail) => detail.fixedAssetId));
    const hasDuplicate = choices.some((choice) => {
      const id = choice.asset._id;
      if (!id || selected.has(id)) return true;
      selected.add(id);
      return false;
    });
    if (hasDuplicate) {
      toast({ title: t('fxa-asset-already-selected'), variant: 'destructive' });
      return false;
    }
    form.setValue(
      `trDocs.${index}.details`,
      [
        ...details.filter((detail) => detail.fixedAssetId),
        ...choices.map((choice) =>
          makeDetail(choice.asset._id || '', choice.asset.accountId || ''),
        ),
      ],
      { shouldDirty: true },
    );
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <DescriptionField form={form} index={index} />
      </div>
      <p className="text-sm text-muted-foreground">
        {t(
          trDoc.journal === TrJournalEnum.FXA_REVALUATION
            ? 'fxa-revaluation-help'
            : 'fxa-capital-help',
        )}
      </p>
      {mixedDirections && (
        <p role="alert" className="text-sm text-destructive">
          {t('fxa-capital-mixed-direction')}
        </p>
      )}
      <ScrollArea className="w-full pb-3">
        <Table className="min-w-[960px]">
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-8 p-0" />
              <Table.Head>{t('fixed-asset')}</Table.Head>
              <Table.Head className="w-44">{t('fxa-old-unit-cost')}</Table.Head>
              <Table.Head className="w-44">{t('fxa-new-unit-cost')}</Table.Head>
              <Table.Head className="w-44">
                {t('fxa-new-useful-years')}
              </Table.Head>
              <Table.Head className="w-44">{t('fxa-capital-total')}</Table.Head>
              <Table.Head className="w-8 p-0" />
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
                  onValuationChange={onValuationChange}
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
                      return false;
                    }
                    form.setValue(
                      `trDocs.${index}.details`,
                      details
                        .filter(
                          (_item, i) =>
                            i === detailIndex || !indices.includes(i),
                        )
                        .map((item) =>
                          item._id === detail._id
                            ? {
                                ...makeDetail(assetId, accountId),
                                _id: detail._id,
                              }
                            : item,
                        ),
                      { shouldDirty: true },
                    );
                    return true;
                  }}
                />
              );
            })}
            {!rows.length && (
              <Table.Row>
                <Table.Cell
                  colSpan={7}
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
        <FixedAssetChooser
          journal={trDoc.journal}
          date={date}
          branchId={trDoc.branchId}
          departmentId={trDoc.departmentId}
          excludeTransactionId={trDoc._id}
          allLocations
          multiple
          onChoose={addAssets}
        >
          <Button type="button" variant="secondary">
            <IconPlus className="size-4" />
            {t('add-multiple-assets')}
          </Button>
        </FixedAssetChooser>
      </div>
    </div>
  );
};
