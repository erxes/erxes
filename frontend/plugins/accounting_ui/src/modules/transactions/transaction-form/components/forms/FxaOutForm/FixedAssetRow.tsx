import { FixedAssetChooser } from '@/settings/fixed-assets/components/chooser/FixedAssetChooser';
import { applyFxaChoices } from '@/transactions/transaction-form/components/helpers/applyFxaChoice';
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
  const branchId = detail.branchId ?? '';
  const departmentId = detail.departmentId ?? '';
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

  const setCostAmount = (count?: number, unitPrice?: number) => {
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      (count || 0) * (unitPrice || 0),
    );
  };

  return (
    <Table.Row className="overflow-hidden h-cell hover:bg-background!">
      <Table.Cell className="w-8 p-0">
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
        <Table.Cell className="w-8">
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
              <FixedAssetChooser
                journal={trDoc.journal}
                date={date}
                multiple
                value={field.value || ''}
                branchId={branchId}
                departmentId={departmentId}
                excludeTransactionId={trDoc._id}
                onChoose={(choices) => {
                  applyFxaChoices(form, journalIndex, detailIndex, choices);
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
                  setCostAmount(nextCount, detail.unitPrice);
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
              <InputNumber value={field.value ?? 0} disabled />
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
              <InputNumber value={field.value ?? 0} disabled />
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
