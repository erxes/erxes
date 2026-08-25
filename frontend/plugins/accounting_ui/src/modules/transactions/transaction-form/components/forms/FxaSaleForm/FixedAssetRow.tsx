import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
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
import {
  clearFxaInstanceSelectionForDetail,
  FxaInstanceSelectionSheet,
} from '../../helpers/FxaInstanceSelectionSheet';

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
  const showAdvancedView = useAtomValue(showAdvancedViewState);

  const handleFixedAssetChange = (fixedAssetId: string | string[]) => {
    const nextFixedAssetId = Array.isArray(fixedAssetId)
      ? fixedAssetId[0] || ''
      : fixedAssetId || '';

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.fixedAssetId`,
      nextFixedAssetId,
    );
    clearFxaInstanceSelectionForDetail({
      detailId: detail._id,
      form,
      journalIndex,
      selectedIdsByDetailId: trDoc.extraData?.fxaInstanceIdsByDetailId,
      selectedSelectionsByDetailId:
        trDoc.extraData?.fxaInstanceSelectionsByDetailId,
    });
  };

  const setAmount = (count?: number, unitPrice?: number) => {
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      (count || 0) * (unitPrice || 0),
    );
  };

  return (
    <Table.Row className="overflow-hidden h-cell hover:bg-background!">
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell className="w-10">
          <FxaInstanceSelectionSheet
            form={form}
            journalIndex={journalIndex}
            detailIndex={detailIndex}
            compact
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
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
                  field.onChange(value || 0);
                  setAmount(value || 0, detail.unitPrice);
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
