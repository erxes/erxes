import { useQuery } from '@apollo/client';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Checkbox, Form, InputNumber, Select, Table } from 'erxes-ui';
import { useFieldArray, useWatch } from 'react-hook-form';
import { FIXED_ASSETS_QUERY } from '../../../graphql/queries/fixedAssets';
import { ITransactionGroupForm, TFxaDetail } from '../../../types/JournalForms';
import { getTempId } from '../../utils';

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
    <Select
      value={value || ''}
      onValueChange={onValueChange}
    >
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

const getFxaDetailDefaultValues = (
  detail?: Partial<TFxaDetail>,
): TFxaDetail => ({
  ...(detail || {}),
  _id: getTempId(),
  accountId: detail?.accountId || '',
  fixedAssetId: detail?.fixedAssetId || '',
  count: detail?.count ?? 0,
  unitPrice: detail?.unitPrice ?? 0,
  amount: detail?.amount ?? 0,
  checked: false,
});

export const FxaOutDetailsTable = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  });
  const details = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  });

  const removeChecked = () => {
    form.setValue(
      `trDocs.${journalIndex}.details`,
      details.filter((detail) => !detail.checked),
    );
  };

  return (
    <div className="space-y-3 pt-3">
      <Table className="overflow-hidden rounded-lg bg-sidebar border-sidebar">
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10" />
            <Table.Head>Данс</Table.Head>
            <Table.Head>Үндсэн хөрөнгө</Table.Head>
            <Table.Head>Тоо</Table.Head>
            <Table.Head>Нэгж үнэ</Table.Head>
            <Table.Head>Дүн</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {fields.map((field, detailIndex) => {
            const detail = details[detailIndex];
            const fieldName = (name: string) =>
              `trDocs.${journalIndex}.details.${detailIndex}.${name}` as any;
            const setAmount = (count?: number, unitPrice?: number) => {
              form.setValue(
                fieldName('amount'),
                (count || 0) * (unitPrice || 0),
              );
            };

            return (
              <Table.Row key={field.id}>
                <Table.Cell>
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
                </Table.Cell>
                <Table.Cell>
                  <Form.Field
                    control={form.control}
                    name={fieldName('accountId')}
                    render={({ field }) => (
                      <SelectAccount
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        defaultFilter={{
                          journals: [JournalEnum.FIXED_ASSET],
                          permissionMode: 'write',
                        }}
                        variant="ghost"
                        scope={AccountingHotkeyScope.TransactionFormPage}
                      />
                    )}
                  />
                </Table.Cell>
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
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <div className="flex justify-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="bg-border"
          onClick={() => append(getFxaDetailDefaultValues())}
        >
          <IconPlus />
          Шинэ мөр
        </Button>
        {!!details.filter((detail) => detail.checked).length && (
          <Button
            type="button"
            variant="secondary"
            className="bg-destructive/10 text-destructive"
            onClick={removeChecked}
          >
            <IconX />
            Сонгосныг хасах
          </Button>
        )}
      </div>
    </div>
  );
};
