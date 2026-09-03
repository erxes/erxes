import {
  SelectFixedAsset,
  TSelectedFixedAsset,
} from '@/settings/fixed-assets/components/SelectFixedAsset';
import { useFixedAssetLocationRemainder } from '@/settings/fixed-assets/hooks/useFixedAssetLocationRemainder';
import {
  Checkbox,
  Form,
  InputNumber,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TFxaDetail,
  TTrDoc,
} from '../../../types/JournalForms';
import { showAdvancedViewState } from '../../../states/trStates';
import { FxaDetailLocationCells } from '../FxaDetailLocationCells';
import { FxaOwnerRecordsSheet } from '../FxaOwnerRecordsSheet';
import { useEffect } from 'react';

export const FixedAssetRow = ({
  form,
  journalIndex,
  detailIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  detailIndex: number;
}) => {
  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  }) as TFxaDetail;
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TTrDoc;
  const date = useWatch({
    control: form.control,
    name: 'date',
  }) as Date | undefined;
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const branchId = detail.branchId || trDoc.branchId || '';
  const departmentId = detail.departmentId || trDoc.departmentId || '';
  const { fixedAssetLocationRemainder } = useFixedAssetLocationRemainder({
    variables: {
      fixedAssetId: detail.fixedAssetId,
      branchId,
      departmentId,
      date,
      excludeTransactionId: trDoc._id,
    },
    skip: !detail.fixedAssetId,
  });
  const maxCount =
    fixedAssetLocationRemainder?.remainder === undefined
      ? undefined
      : Math.max(0, fixedAssetLocationRemainder.remainder);

  const handleFixedAssetChange = (fixedAssetId: string | string[]) => {
    const nextFixedAssetId = Array.isArray(fixedAssetId)
      ? fixedAssetId[0] || ''
      : fixedAssetId || '';

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.fixedAssetId`,
      nextFixedAssetId,
    );
  };

  const handleFixedAssetCallback = (fixedAsset: TSelectedFixedAsset) => {
    const count = detail.count || 1;

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.fixedAssetCategoryId`,
      fixedAsset.categoryId || '',
    );
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.branchId`,
      detail.branchId || trDoc.branchId || '',
    );
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.departmentId`,
      detail.departmentId || trDoc.departmentId || '',
    );
    form.setValue(`trDocs.${journalIndex}.details.${detailIndex}.count`, count);
    setAmount(count, detail.unitPrice);
  };

  const setAmount = (count?: number, unitPrice?: number) => {
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      (count || 0) * (unitPrice || 0),
    );
  };

  useEffect(() => {
    if (maxCount === undefined) {
      return;
    }

    const currentCount = detail.count || 0;
    const nextCount =
      currentCount === 0 && maxCount > 0 ? 1 : Math.min(currentCount, maxCount);

    if (nextCount === currentCount) {
      return;
    }

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.count`,
      nextCount,
    );
    setAmount(nextCount, detail.unitPrice);
  }, [
    detail.count,
    detail.unitPrice,
    detailIndex,
    form,
    journalIndex,
    maxCount,
  ]);

  return (
    <Table.Row className="overflow-hidden h-cell hover:bg-background!">
      <Table.Cell className="w-10 p-0">
        <FxaOwnerRecordsSheet
          form={form}
          journalIndex={journalIndex}
          detailIndex={detailIndex}
        />
      </Table.Cell>
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell className="w-10">
          <RecordTableInlineCell className="justify-center">
            <Form.Field
              control={form.control}
              name={`trDocs.${journalIndex}.details.${detailIndex}.checked`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </RecordTableInlineCell>
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.fixedAssetId`}
            render={({ field }) => (
              <SelectFixedAsset.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={handleFixedAssetChange}
                onCallback={handleFixedAssetCallback}
                placeholder="Үндсэн хөрөнгө"
                className="h-8 min-w-60"
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.count`}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? 0}
                onChange={(value) => {
                  const nextCount =
                    maxCount === undefined
                      ? value || 0
                      : Math.min(value || 0, maxCount);

                  field.onChange(nextCount);
                  setAmount(nextCount, detail.unitPrice);
                }}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.unitPrice`}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? 0}
                onChange={(value) => {
                  field.onChange(value || 0);
                  setAmount(detail.count, value || 0);
                }}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.amount`}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? 0}
                onChange={(value) => field.onChange(value || 0)}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      {showAdvancedView && (
        <FxaDetailLocationCells
          detailId={detail._id}
          detailIndex={detailIndex}
          form={form}
          journalIndex={journalIndex}
        />
      )}
    </Table.Row>
  );
};
