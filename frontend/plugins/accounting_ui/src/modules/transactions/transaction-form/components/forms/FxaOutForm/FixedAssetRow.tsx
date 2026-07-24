import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import {
  Checkbox,
  Form,
  InputNumber,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { type Path, useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TAddTransactionGroup,
  TFxaDetail,
} from '../../../types/JournalForms';
import { FxaInstanceSelectionSheet } from '../../helpers/FxaInstanceSelectionSheet';

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
  const fieldName = (name: string) =>
    `trDocs.${journalIndex}.details.${detailIndex}.${name}` as Path<TAddTransactionGroup>;

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
              name={fieldName('checked')}
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
            name={fieldName('fixedAssetId')}
            render={({ field }) => (
              <SelectFixedAsset.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={field.onChange}
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
            name={fieldName('count')}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? 0}
                onChange={(value) => field.onChange(value || 0)}
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
            name={fieldName('unitPrice')}
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
            name={fieldName('amount')}
            render={({ field }) => (
              <InputNumber value={field.value ?? 0} disabled />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
    </Table.Row>
  );
};
