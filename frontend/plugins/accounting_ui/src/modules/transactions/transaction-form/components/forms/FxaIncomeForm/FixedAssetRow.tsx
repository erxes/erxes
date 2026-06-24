import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  CurrencyField,
  Form,
  InputNumber,
  PopoverScoped,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Select } from 'erxes-ui';
import { FIXED_ASSETS_QUERY } from '../../../graphql/queries/fixedAssets';
import { taxPercentsState } from '../../../states/trStates';
import {
  ITransactionGroupForm,
  TFxaDetail,
  TFxaIncomeJournal,
} from '../../../types/JournalForms';
import { FxaIncomeDetailInstancesSheet } from './FxaIncomeInstancesSheet';

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
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TFxaIncomeJournal;
  const [taxPercents] = useAtom(taxPercentsState);
  const rowPercent = useMemo(() => {
    let percent = taxPercents.sum ?? 0;

    if (detail.excludeVat) {
      percent -= taxPercents.vat ?? 0;
    }
    if (detail.excludeCtax) {
      percent -= taxPercents.ctax ?? 0;
    }

    return percent;
  }, [
    detail.excludeCtax,
    detail.excludeVat,
    taxPercents.ctax,
    taxPercents.sum,
    taxPercents.vat,
  ]);

  const calcTaxAmounts = (count?: number, unitPrice?: number) => {
    const unitPriceWithTax = ((unitPrice ?? 0) / 100) * (100 + rowPercent);

    return {
      unitPriceWithTax,
      amountWithTax: unitPriceWithTax * (count ?? 0),
    };
  };
  const [taxAmounts, setTaxAmounts] = useState(() =>
    calcTaxAmounts(detail.count, detail.unitPrice),
  );

  useEffect(() => {
    if (!(trDoc.hasVat || trDoc.hasCtax)) {
      return;
    }

    setTaxAmounts(calcTaxAmounts(detail.count, detail.unitPrice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    detail._id,
    detail.count,
    detail.unitPrice,
    rowPercent,
    trDoc.hasCtax,
    trDoc.hasVat,
  ]);

  const updateAmount = (count?: number, unitPrice?: number) => {
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      (count || 0) * (unitPrice || 0),
    );

    if (trDoc.hasVat || trDoc.hasCtax) {
      setTaxAmounts(calcTaxAmounts(count, unitPrice));
    }
  };

  const updateFromAmount = (amount: number) => {
    const unitPrice = detail.count ? amount / detail.count : 0;

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.unitPrice`,
      unitPrice,
    );
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      amount,
    );

    if (trDoc.hasVat || trDoc.hasCtax) {
      setTaxAmounts(calcTaxAmounts(detail.count, unitPrice));
    }
  };

  const handleTaxValueChange = (key: 'unitPrice' | 'amount', value: number) => {
    const amountWithTax =
      key === 'amount' ? value : value * (detail.count ?? 0);
    const unitPriceWithTax =
      key === 'amount' ? value / (detail.count || 1) : value;

    setTaxAmounts({ unitPriceWithTax, amountWithTax });
    const unitPrice = (unitPriceWithTax / (100 + rowPercent)) * 100;

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.unitPrice`,
      unitPrice,
    );
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      unitPrice * (detail.count || 0),
    );
  };

  const handleExcludeTax = (
    type: 'vat' | 'ctax',
    checked: boolean,
    onChange: (value: boolean) => void,
  ) => {
    let percent = taxPercents.sum ?? 0;

    if (type === 'vat' ? !checked : detail.excludeVat) {
      percent -= taxPercents.vat ?? 0;
    }
    if (type === 'ctax' ? !checked : detail.excludeCtax) {
      percent -= taxPercents.ctax ?? 0;
    }

    const unitPriceWithTax = ((detail.unitPrice ?? 0) / 100) * (100 + percent);
    setTaxAmounts({
      unitPriceWithTax,
      amountWithTax: unitPriceWithTax * (detail.count ?? 0),
    });
    onChange(!checked);
  };

  return (
    <Table.Row className="overflow-hidden h-cell hover:bg-background!">
      <RecordTableHotKeyControl
        rowId={detail._id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell className="w-10">
          <FxaIncomeDetailInstancesSheet
            form={form}
            journalIndex={journalIndex}
            detailIndex={detailIndex}
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
                    onChange={(value) => {
                      field.onChange(value || 0);
                      updateAmount(value || 0, detail.unitPrice);
                    }}
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
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
                    value={field.value ?? 0}
                    onChange={(value) => {
                      field.onChange(value || 0);
                      updateAmount(detail.count, value || 0);
                    }}
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
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
          <PopoverScoped
            scope={`trDocs.${journalIndex}.details.${detailIndex}.amount`}
            closeOnEnter
          >
            <RecordTableInlineCell.Trigger>
              {((detail.count || 0) * (detail.unitPrice || 0)).toLocaleString()}
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <CurrencyField.ValueInput
                value={(detail.count || 0) * (detail.unitPrice || 0)}
                onChange={(value) => updateFromAmount(value || 0)}
              />
            </RecordTableInlineCell.Content>
          </PopoverScoped>
        </Table.Cell>
      </RecordTableHotKeyControl>
      {trDoc.hasVat && (
        <RecordTableHotKeyControl
          rowId={detail._id}
          rowIndex={detailIndex}
          enableOnFormTags
        >
          <Table.Cell>
            <RecordTableInlineCell className="justify-center">
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.details.${detailIndex}.excludeVat`}
                render={({ field }) => (
                  <Checkbox
                    checked={!field.value}
                    onCheckedChange={(checked) =>
                      handleExcludeTax('vat', Boolean(checked), field.onChange)
                    }
                  />
                )}
              />
            </RecordTableInlineCell>
          </Table.Cell>
        </RecordTableHotKeyControl>
      )}
      {trDoc.hasCtax && (
        <RecordTableHotKeyControl
          rowId={detail._id}
          rowIndex={detailIndex}
          enableOnFormTags
        >
          <Table.Cell>
            <RecordTableInlineCell className="justify-center">
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.details.${detailIndex}.excludeCtax`}
                render={({ field }) => (
                  <Checkbox
                    checked={!field.value}
                    onCheckedChange={(checked) =>
                      handleExcludeTax('ctax', Boolean(checked), field.onChange)
                    }
                  />
                )}
              />
            </RecordTableInlineCell>
          </Table.Cell>
        </RecordTableHotKeyControl>
      )}
      {(trDoc.hasVat || trDoc.hasCtax) && (
        <>
          <RecordTableHotKeyControl
            rowId={detail._id}
            rowIndex={detailIndex}
            enableOnFormTags
          >
            <Table.Cell>
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.unitPrice-with-tax`}
                closeOnEnter
              >
                <RecordTableInlineCell.Trigger>
                  {taxAmounts.unitPriceWithTax.toLocaleString()}
                </RecordTableInlineCell.Trigger>
                <RecordTableInlineCell.Content>
                  <CurrencyField.ValueInput
                    value={taxAmounts.unitPriceWithTax}
                    onChange={(value) =>
                      handleTaxValueChange('unitPrice', value || 0)
                    }
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            </Table.Cell>
          </RecordTableHotKeyControl>
          <RecordTableHotKeyControl
            rowId={detail._id}
            rowIndex={detailIndex}
            enableOnFormTags
          >
            <Table.Cell>
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.amount-with-tax`}
                closeOnEnter
              >
                <RecordTableInlineCell.Trigger>
                  {taxAmounts.amountWithTax.toLocaleString()}
                </RecordTableInlineCell.Trigger>
                <RecordTableInlineCell.Content>
                  <CurrencyField.ValueInput
                    value={taxAmounts.amountWithTax}
                    onChange={(value) =>
                      handleTaxValueChange('amount', value || 0)
                    }
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
