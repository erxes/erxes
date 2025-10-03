import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  cn,
  CurrencyField,
  Form,
  InputNumber,
  RecordTableInlineCell,
  RecordTableHotKeyControl,
  Popover,
  Table,
  PopoverScoped,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { taxPercentsState } from '../../../states/trStates';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const InventoryRow = ({
  detailIndex,
  journalIndex,
  form,
}: {
  detailIndex: number;
  journalIndex: number;
  form: ITransactionGroupForm;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });

  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });

  const [taxPercents] = useAtom(taxPercentsState);

  const rowPercent = useMemo(() => {
    let percent = taxPercents.sum ?? 0;
    if (detail.excludeVat) {
      percent = percent - (taxPercents.vat ?? 0);
    }
    if (detail.excludeCtax) {
      percent = percent - (taxPercents.ctax ?? 0);
    }
    return percent;
  }, [
    taxPercents.sum,
    taxPercents.vat,
    taxPercents.ctax,
    detail.excludeVat,
    detail.excludeCtax,
  ]);

  const [taxAmounts, setTaxAmounts] = useState({
    unitPriceWithTax: ((detail.unitPrice ?? 0) / 100) * (100 + rowPercent),
    amountWithTax: ((detail.amount ?? 0) / 100) * (100 + rowPercent),
  });

  const { unitPrice, count, _id } = detail;

  const getFieldName = (name: string) => {
    return `trDocs.${journalIndex}.details.${detailIndex}.${name}`;
  };

  const handleAmountChange = (value: number) => {
    const newUnitPrice = count ? value / count : 0;
    form.setValue(getFieldName('unitPrice') as any, newUnitPrice);
    if (trDoc.hasVat || trDoc.hasCtax) {
      setTaxAmounts({
        unitPriceWithTax: (newUnitPrice / 100) * (100 + rowPercent),
        amountWithTax: (value / 100) * (100 + rowPercent),
      });
    }
  };

  const calcAmount = (pCount?: number, pUnitPrice?: number) => {
    const newAmount = (pCount ?? 0) * (pUnitPrice ?? 0);
    form.setValue(getFieldName('amount') as any, newAmount);

    if (trDoc.hasVat || trDoc.hasCtax) {
      setTaxAmounts({
        unitPriceWithTax: ((pUnitPrice ?? 0) / 100) * (100 + rowPercent),
        amountWithTax: (newAmount / 100) * (100 + rowPercent),
      });
    }
  };

  const handleCountChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    calcAmount(value, unitPrice ?? 0);
    onChange(value);
  };

  const handleUnitPriceChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    calcAmount(count ?? 0, value);
    onChange(value);
  };

  const handleTaxValueChange = (key: string, value: number) => {
    const amountWithTax = key === 'amount' ? value : value * (count ?? 0);
    const unitPriceWithTax = key === 'amount' ? value / (count ?? 1) : value;

    setTaxAmounts({ unitPriceWithTax, amountWithTax });

    form.setValue(
      getFieldName('unitPrice') as any,
      (unitPriceWithTax / (100 + rowPercent)) * 100,
    );
  };

  const handleExcludeTax = (
    type: string,
    checked: boolean,
    onChange: (value: boolean) => void,
  ) => {
    let percent = taxPercents.sum ?? 0;

    if (type === 'vat' ? !checked : detail.excludeVat) {
      percent = percent - (taxPercents.vat ?? 0);
    }

    if (type === 'ctax' ? !checked : detail.excludeCtax) {
      percent = percent - (taxPercents.ctax ?? 0);
    }

    const unitPriceWithTax = ((unitPrice ?? 0) / 100) * (100 + percent);
    setTaxAmounts({
      unitPriceWithTax,
      amountWithTax: unitPriceWithTax * (count ?? 0),
    });
    onChange(!checked);
  };

  return (
    <Table.Row
      key={_id}
      className={cn(
        'overflow-hidden h-cell hover:!bg-background',
        detailIndex === 0 && '[&>td]:border-t',
      )}
    >
      <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
        <Table.Cell
          className={cn({
            'border-t': detailIndex === 0,
            'rounded-tl-lg': detailIndex === 0,
            'rounded-bl-lg': detailIndex === trDoc.details.length - 1,
          })}
        >
          <RecordTableInlineCell className="justify-center">
            <Form.Field
              control={form.control}
              name={`trDocs.${journalIndex}.details.${detailIndex}.checked`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </RecordTableInlineCell>
        </Table.Cell>
      </RecordTableHotKeyControl>

      <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.accountId`}
            render={({ field }) => (
              <SelectAccount
                value={field.value || ''}
                onValueChange={(accountId) => {
                  field.onChange(accountId);
                }}
                defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                variant="ghost"
                inForm
                scope={AccountingHotkeyScope.TransactionFormPage}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.productId`}
            render={({ field }) => (
              <SelectProduct
                value={field.value || ''}
                onValueChange={(productId) => {
                  field.onChange(productId);
                }}
                variant="ghost"
                scope={AccountingHotkeyScope.TransactionFormPage}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.count`}
            render={({ field }) => (
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.count`}
                closeOnEnter
              >
                <Form.Control>
                  <RecordTableInlineCell.Trigger>
                    {field.value?.toLocaleString() || 0}
                  </RecordTableInlineCell.Trigger>
                </Form.Control>
                <RecordTableInlineCell.Content>
                  <InputNumber
                    value={field.value ?? 0}
                    onChange={(value) =>
                      handleCountChange(value || 0, field.onChange)
                    }
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.unitPrice`}
            render={({ field }) => (
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.unitPrice`}
                closeOnEnter
              >
                <Form.Control>
                  <RecordTableInlineCell.Trigger>
                    {field.value?.toLocaleString() || 0}
                  </RecordTableInlineCell.Trigger>
                </Form.Control>
                <RecordTableInlineCell.Content>
                  <CurrencyField.ValueInput
                    value={field.value || 0}
                    onChange={(value) =>
                      handleUnitPriceChange(value || 0, field.onChange)
                    }
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
      <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
        <Table.Cell>
          <PopoverScoped
            scope={`trDocs.${journalIndex}.details.${detailIndex}.tempAmount`}
            closeOnEnter
          >
            <RecordTableInlineCell.Trigger>
              {((unitPrice ?? 0) * (count ?? 0)).toLocaleString() || 0}
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <CurrencyField.ValueInput
                value={(unitPrice ?? 0) * (count ?? 0) || 0}
                onChange={(value) => handleAmountChange(value || 0)}
              />
            </RecordTableInlineCell.Content>
          </PopoverScoped>
        </Table.Cell>
      </RecordTableHotKeyControl>

      {trDoc.hasVat && (
        <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
          <Table.Cell
            className={cn({
              'border-t': detailIndex === 0,
            })}
          >
            <RecordTableInlineCell className="justify-center">
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.details.${detailIndex}.excludeVat`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Checkbox
                        checked={!field.value}
                        onCheckedChange={(checked) =>
                          handleExcludeTax(
                            'vat',
                            Boolean(checked),
                            field.onChange,
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </RecordTableInlineCell>
          </Table.Cell>
        </RecordTableHotKeyControl>
      )}

      {trDoc.hasCtax && (
        <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
          <Table.Cell
            className={cn({
              'border-t': detailIndex === 0,
            })}
          >
            <RecordTableInlineCell className="justify-center">
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.details.${detailIndex}.excludeCtax`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Checkbox
                        checked={!field.value}
                        onCheckedChange={(checked) =>
                          handleExcludeTax(
                            'ctax',
                            Boolean(checked),
                            field.onChange,
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </RecordTableInlineCell>
          </Table.Cell>
        </RecordTableHotKeyControl>
      )}

      {(trDoc.hasVat || trDoc.hasCtax) && (
        <>
          <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
            <Table.Cell>
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.untiPriceWithTax`}
                closeOnEnter
              >
                <Form.Control>
                  <RecordTableInlineCell.Trigger>
                    {taxAmounts.unitPriceWithTax?.toLocaleString() || 0}
                  </RecordTableInlineCell.Trigger>
                </Form.Control>
                <RecordTableInlineCell.Content>
                  <CurrencyField.ValueInput
                    value={taxAmounts.unitPriceWithTax ?? 0}
                    onChange={(value) =>
                      handleTaxValueChange('unitPrice', value)
                    }
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            </Table.Cell>
          </RecordTableHotKeyControl>

          <RecordTableHotKeyControl rowId={_id} rowIndex={detailIndex}>
            <Table.Cell
              className={cn({
                'border-t': detailIndex === 0,
                'rounded-br-lg': detailIndex === trDoc.details.length - 1,
              })}
            >
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.amountWithTax`}
                closeOnEnter
              >
                <RecordTableInlineCell.Trigger>
                  {taxAmounts.amountWithTax?.toLocaleString() || 0}
                </RecordTableInlineCell.Trigger>
                <RecordTableInlineCell.Content>
                  <CurrencyField.ValueInput
                    value={taxAmounts.amountWithTax ?? 0}
                    onChange={(value) => handleTaxValueChange('amount', value)}
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            </Table.Cell>
          </RecordTableHotKeyControl>
        </>
      )}
    </Table.Row>
  );
};
