import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_SIDES } from '@/transactions/types/constants';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  cn,
  CurrencyField,
  fixNum,
  Form,
  PopoverScoped,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { FieldPath, useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import { useGetAccCurrentCost } from '../../../hooks/useGetInvCostInfo';
import { showAdvancedViewState } from '../../../states/trStates';
import {
  ITransactionGroupForm,
  TAddTransactionGroup,
  TInvDetail,
  TInvJustifyJournal,
} from '../../../types/JournalForms';
import {
  DUPLICATE_PRODUCT_CELL_CLASS,
  hasDuplicateProductId,
} from '../../utils';

export const InventoryRow = ({
  detailIndex,
  journalIndex,
  form,
}: {
  detailIndex: number;
  journalIndex: number;
  form: ITransactionGroupForm;
}) => {
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvJustifyJournal;
  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });
  const hasDuplicateProduct = hasDuplicateProductId(
    trDoc.details,
    detail.productId,
  );
  const { unitPrice, _id } = detail;

  const getFieldName = (name: keyof TInvDetail) =>
    `trDocs.${journalIndex}.details.${detailIndex}.${name}` as FieldPath<TAddTransactionGroup>;

  const { currentCostInfo, loading } = useGetAccCurrentCost({
    variables: {
      accountId: detail.accountId,
      branchId: detail.branchId || trDoc.branchId,
      departmentId: detail.departmentId || trDoc.departmentId,
      productIds: [detail.productId],
      excludedTransactionIds: trDoc._id ? [trDoc._id] : undefined,
    },
    skip: !detail.productId || !detail.accountId,
  });
  const currentProductCost = currentCostInfo?.[detail.productId || ''];
  const currentUnitCost = currentProductCost?.unitCost ?? 0;
  const currentRemainder = currentProductCost?.remainder ?? 0;
  const isDecrease = trDoc.side === TR_SIDES.CREDIT;
  const maxDecreaseUnitPrice = Math.max(0, currentUnitCost);
  const maxDecreaseAmount = Math.max(
    0,
    fixNum(currentRemainder * maxDecreaseUnitPrice),
  );
  const afterUnitCost = fixNum(
    currentUnitCost + (isDecrease ? -1 : 1) * (unitPrice ?? 0),
  );

  useEffect(() => {
    if (loading || currentProductCost === undefined) return;

    form.setValue(getFieldName('count'), 0);
    form.setValue(
      getFieldName('amount'),
      fixNum(currentProductCost.remainder * (unitPrice ?? 0)),
    );
  }, [currentCostInfo, detail.productId, loading]);

  useEffect(() => {
    if (!isDecrease || (unitPrice ?? 0) <= maxDecreaseUnitPrice) return;

    form.setValue(getFieldName('unitPrice'), maxDecreaseUnitPrice);
    form.setValue(getFieldName('amount'), maxDecreaseAmount);
  }, [isDecrease, maxDecreaseAmount, maxDecreaseUnitPrice, unitPrice]);

  const handleUnitPriceChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    const nextUnitPrice = isDecrease
      ? Math.min(value, maxDecreaseUnitPrice)
      : value;
    form.setValue(
      getFieldName('amount'),
      fixNum(currentRemainder * nextUnitPrice),
    );
    onChange(nextUnitPrice);
  };

  const handleAmountChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    const nextAmount = isDecrease ? Math.min(value, maxDecreaseAmount) : value;
    onChange(nextAmount);
    form.setValue(
      getFieldName('unitPrice'),
      currentRemainder ? nextAmount / currentRemainder : 0,
    );
  };

  const handleAfterUnitCostChange = (value: number) => {
    const difference = fixNum(Math.max(0, value) - currentUnitCost);

    if (difference > 0 && trDoc.side !== TR_SIDES.DEBIT) {
      form.setValue(`trDocs.${journalIndex}.side`, TR_SIDES.DEBIT);
    }
    if (difference < 0 && trDoc.side !== TR_SIDES.CREDIT) {
      form.setValue(`trDocs.${journalIndex}.side`, TR_SIDES.CREDIT);
    }

    const nextUnitPrice = Math.abs(difference);
    form.setValue(getFieldName('unitPrice'), nextUnitPrice);
    form.setValue(
      getFieldName('amount'),
      fixNum(currentRemainder * nextUnitPrice),
    );
  };

  return (
    <Table.Row
      key={_id}
      className={cn(
        'overflow-hidden h-cell hover:bg-background!',
        detailIndex === 0 && '[&>td]:border-t',
      )}
    >
      <RecordTableHotKeyControl
        rowId={_id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
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

      <RecordTableHotKeyControl
        rowId={_id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.accountId`}
            render={({ field }) => (
              <SelectAccount
                value={field.value || ''}
                onValueChange={field.onChange}
                defaultFilter={{
                  journals: [JournalEnum.INVENTORY],
                  permissionMode: 'write',
                }}
                variant="ghost"
                scope={AccountingHotkeyScope.TransactionFormPage}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>

      <RecordTableHotKeyControl
        rowId={_id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell
          className={cn(hasDuplicateProduct && DUPLICATE_PRODUCT_CELL_CLASS)}
        >
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.productId`}
            render={({ field }) => (
              <SelectProduct
                value={field.value || ''}
                onValueChange={(productId) => field.onChange(productId)}
                variant="ghost"
                scope={AccountingHotkeyScope.TransactionFormPage}
              />
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>

      <Table.Cell>{currentRemainder.toLocaleString()}</Table.Cell>
      <Table.Cell>{currentUnitCost.toLocaleString()}</Table.Cell>

      <RecordTableHotKeyControl
        rowId={_id}
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

      <RecordTableHotKeyControl
        rowId={_id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <PopoverScoped
            scope={`trDocs.${journalIndex}.details.${detailIndex}.afterUnitCost`}
            closeOnEnter
          >
            <RecordTableInlineCell.Trigger>
              {afterUnitCost.toLocaleString()}
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <CurrencyField.ValueInput
                value={afterUnitCost}
                onChange={(value) =>
                  handleAfterUnitCostChange(value ?? currentUnitCost)
                }
              />
            </RecordTableInlineCell.Content>
          </PopoverScoped>
        </Table.Cell>
      </RecordTableHotKeyControl>

      <RecordTableHotKeyControl
        rowId={_id}
        rowIndex={detailIndex}
        enableOnFormTags
      >
        <Table.Cell>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.details.${detailIndex}.amount`}
            render={({ field }) => (
              <PopoverScoped
                scope={`trDocs.${journalIndex}.details.${detailIndex}.amount`}
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
                      handleAmountChange(value || 0, field.onChange)
                    }
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>

      {showAdvancedView && (
        <>
          <RecordTableHotKeyControl
            rowId={_id}
            rowIndex={detailIndex}
            enableOnFormTags
          >
            <Table.Cell>
              <RecordTableInlineCell className="justify-center">
                <Form.Field
                  control={form.control}
                  name={`trDocs.${journalIndex}.details.${detailIndex}.branchId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <SelectBranches.InlineCell
                          mode="single"
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                          scope={AccountingHotkeyScope.TransactionFormPage}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </RecordTableInlineCell>
            </Table.Cell>
          </RecordTableHotKeyControl>
          <RecordTableHotKeyControl
            rowId={_id}
            rowIndex={detailIndex}
            enableOnFormTags
          >
            <Table.Cell>
              <RecordTableInlineCell className="justify-center">
                <Form.Field
                  control={form.control}
                  name={`trDocs.${journalIndex}.details.${detailIndex}.departmentId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <SelectDepartments.InlineCell
                          mode="single"
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                          scope={AccountingHotkeyScope.TransactionFormPage}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </RecordTableInlineCell>
            </Table.Cell>
          </RecordTableHotKeyControl>
        </>
      )}
    </Table.Row>
  );
};
