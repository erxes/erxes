import { useGetAccCurrentCost } from '../../../hooks/useGetInvCostInfo';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  cn,
  CurrencyField,
  fixNum,
  Form,
  InputNumber,
  RecordTableInlineCell,
  RecordTableHotKeyControl,
  PopoverScoped,
  Table,
} from 'erxes-ui';
import { FieldPath, useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import {
  ITransactionGroupForm,
  TAddTransactionGroup,
  TInvDetail,
  TInvJustifyJournal,
  TInvOutJournal,
} from '../../../types/JournalForms';
import { TR_SIDES } from '~/modules/transactions/types/constants';
import { useEffect } from 'react';
import { showAdvancedViewState } from '../../../states/trStates';
import { useAtomValue } from 'jotai';
import {
  DUPLICATE_PRODUCT_CELL_CLASS,
  hasDuplicateProductId,
} from '../../utils';

export const InventoryRow = ({
  detailIndex,
  journalIndex,
  form,
  isJustify,
}: {
  detailIndex: number;
  journalIndex: number;
  form: ITransactionGroupForm;
  isJustify?: boolean;
}) => {
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvOutJournal | TInvJustifyJournal;

  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });
  const hasDuplicateProduct = hasDuplicateProductId(
    trDoc.details,
    detail.productId,
  );

  const { unitPrice, count, _id } = detail;

  const getFieldName = (name: keyof TInvDetail) => {
    return `trDocs.${journalIndex}.details.${detailIndex}.${name}` as FieldPath<TAddTransactionGroup>;
  };

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

  useEffect(() => {
    if (loading || !currentCostInfo) return;

    const costInfo = currentCostInfo[detail.productId || ''];
    const nextCount = isJustify ? costInfo?.remainder ?? 0 : count ?? 0;
    const nextUnitPrice = isJustify ? unitPrice ?? 0 : costInfo?.unitCost ?? 0;

    form.setValue(getFieldName('unitPrice'), nextUnitPrice);
    form.setValue(getFieldName('count'), isJustify ? 0 : nextCount);
    form.setValue(getFieldName('amount'), nextCount * nextUnitPrice);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCostInfo, detail.productId, loading, isJustify]);

  const currentProductCost = currentCostInfo?.[detail.productId || ''];
  const currentUnitCost = currentProductCost?.unitCost ?? 0;
  const currentRemainder = currentProductCost?.remainder ?? 0;
  const isJustifyDown = isJustify && trDoc.side === TR_SIDES.CREDIT;
  const maxDecreaseUnitPrice = Math.max(0, currentUnitCost);
  const maxDecreaseAmount = Math.max(
    0,
    fixNum(currentRemainder * maxDecreaseUnitPrice),
  );
  const afterUnitCost = fixNum(
    currentUnitCost + (isJustifyDown ? -1 : 1) * (unitPrice ?? 0),
  );

  useEffect(() => {
    if (!isJustifyDown || (unitPrice ?? 0) <= maxDecreaseUnitPrice) return;

    form.setValue(getFieldName('unitPrice'), maxDecreaseUnitPrice);
    form.setValue(getFieldName('amount'), maxDecreaseAmount);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJustifyDown, maxDecreaseAmount, maxDecreaseUnitPrice, unitPrice]);

  const handleAmountChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    const nextAmount = isJustifyDown
      ? Math.min(value, maxDecreaseAmount)
      : value;
    onChange(nextAmount);
    const unitDivider = isJustify ? currentRemainder : count;
    const newUnitPrice = unitDivider ? nextAmount / unitDivider : 0;
    form.setValue(getFieldName('unitPrice'), newUnitPrice);
  };

  const calcAmount = (pCount?: number, pUnitPrice?: number) => {
    const newAmount = (pCount ?? 0) * (pUnitPrice ?? 0);
    form.setValue(getFieldName('amount'), newAmount);
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
    const nextUnitPrice = isJustifyDown
      ? Math.min(value, maxDecreaseUnitPrice)
      : value;
    calcAmount(isJustify ? currentRemainder : count ?? 0, nextUnitPrice);
    onChange(nextUnitPrice);
  };

  const handleAfterUnitCostChange = (value: number) => {
    const nextAfterUnitCost = Math.max(0, value);
    const difference = fixNum(nextAfterUnitCost - currentUnitCost);
    const nextUnitPrice = Math.abs(difference);

    if (difference > 0 && trDoc.side !== TR_SIDES.DEBIT) {
      form.setValue(`trDocs.${journalIndex}.side`, TR_SIDES.DEBIT);
    }
    if (difference < 0 && trDoc.side !== TR_SIDES.CREDIT) {
      form.setValue(`trDocs.${journalIndex}.side`, TR_SIDES.CREDIT);
    }

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
                onValueChange={(accountId) => {
                  // setMount(false)
                  field.onChange(accountId);
                }}
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
      {isJustify ? (
        <>
          <Table.Cell>{currentRemainder.toLocaleString()}</Table.Cell>
          <Table.Cell>{currentUnitCost.toLocaleString()}</Table.Cell>
        </>
      ) : (
        <RecordTableHotKeyControl
          rowId={_id}
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
      )}
      {isJustify ? (
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
      ) : (
        <Table.Cell>{(unitPrice ?? 0).toLocaleString()}</Table.Cell>
      )}
      {isJustify && (
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
      )}
      {isJustify ? (
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
      ) : (
        <Table.Cell>{(detail.amount ?? 0).toLocaleString()}</Table.Cell>
      )}

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
                          onValueChange={(branch) => field.onChange(branch)}
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
                          onValueChange={(department) =>
                            field.onChange(department)
                          }
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
