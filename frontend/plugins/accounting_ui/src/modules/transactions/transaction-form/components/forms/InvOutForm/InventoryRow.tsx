import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  cn,
  Form,
  InputNumber,
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
  TInvOutJournal,
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
  }) as TInvOutJournal;
  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });
  const hasDuplicateProduct = hasDuplicateProductId(
    trDoc.details,
    detail.productId,
  );
  const { unitPrice, count, _id } = detail;

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

  useEffect(() => {
    if (loading || !currentCostInfo) return;

    const costInfo = currentCostInfo[detail.productId || ''];
    if (costInfo === undefined) return;

    const nextUnitPrice = costInfo.unitCost ?? 0;
    form.setValue(getFieldName('unitPrice'), nextUnitPrice);
    form.setValue(getFieldName('amount'), (count ?? 0) * nextUnitPrice);
  }, [currentCostInfo, detail.productId, loading]);

  const handleCountChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    form.setValue(getFieldName('amount'), value * (unitPrice ?? 0));
    onChange(value);
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
          className={cn('w-8', {
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
                <Form.Message />
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

      <Table.Cell>{(unitPrice ?? 0).toLocaleString()}</Table.Cell>
      <Table.Cell>{(detail.amount ?? 0).toLocaleString()}</Table.Cell>

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
