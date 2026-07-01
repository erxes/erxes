import { useQuery } from '@apollo/client';
import {
  Checkbox,
  Form,
  InputNumber,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Select,
  Table,
} from 'erxes-ui';
import { type Path, useWatch } from 'react-hook-form';
import { FIXED_ASSETS_QUERY } from '../../../graphql/queries/fixedAssets';
import {
  ITransactionGroupForm,
  TAddTransactionGroup,
  TFxaDetail,
} from '../../../types/JournalForms';
import { FxaInstanceSelectionSheet } from '../../helpers/FxaInstanceSelectionSheet';

type TFixedAssetOption = {
  _id: string;
  code?: string;
  name?: string;
};

const SelectFixedAsset = ({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange: (value: string) => void;
}) => {
  const { data } = useQuery<{ fixedAssets?: TFixedAssetOption[] }>(
    FIXED_ASSETS_QUERY,
    { variables: { limit: 50 } },
  );
  const fixedAssets = data?.fixedAssets || [];

  return (
    <Select value={value || ''} onValueChange={onValueChange}>
      <Select.Trigger className="h-8 min-w-60">
        <Select.Value placeholder="Үндсэн хөрөнгө" />
      </Select.Trigger>
      <Select.Content>
        {fixedAssets.map((fixedAsset) => (
          <Select.Item key={fixedAsset._id} value={fixedAsset._id}>
            {[fixedAsset.code, fixedAsset.name].filter(Boolean).join(' - ')}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

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

  const setAmount = (count?: number, unitPrice?: number) => {
    form.setValue(fieldName('amount'), (count || 0) * (unitPrice || 0));
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
              <SelectFixedAsset
                value={field.value || ''}
                onValueChange={field.onChange}
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
            name={fieldName('unitPrice')}
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
            name={fieldName('amount')}
            render={({ field }) => (
              <InputNumber
                value={field.value ?? 0}
                onChange={(value) => field.onChange(value || 0)}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
    </Table.Row>
  );
};
