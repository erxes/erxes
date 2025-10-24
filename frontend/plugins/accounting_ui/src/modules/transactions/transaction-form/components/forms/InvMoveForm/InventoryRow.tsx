import { useGetAccCurrentCost } from '../../../hooks/useGetInvCostInfo';
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
  PopoverScoped,
  Table,
} from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { ITransactionGroupForm, TInvMoveJournal } from '../../../types/JournalForms';
import { useEffect, useRef } from 'react';
import { fixSumDtCt, getTempId } from '../../utils';
import { ITransaction, ITrDetail } from '~/modules/transactions/types/Transaction';
import { TR_SIDES, TrJournalEnum } from '~/modules/transactions/types/constants';
import { useAtom } from 'jotai';
import { followTrDocsState } from '../../../states/trStates';

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
  }) as TInvMoveJournal;

  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });

  const { unitPrice, count, _id } = detail;

  const initProductId = useRef(detail.productId);
  const initAccountId = useRef(detail.accountId);
  const initBranchId = useRef(trDoc.branchId);
  const initDepartmentId = useRef(trDoc.departmentId);

  const getFieldName = (name: string) => {
    return `trDocs.${journalIndex}.details.${detailIndex}.${name}` as any;
  };

  const { currentCostInfo, loading } = useGetAccCurrentCost({
    variables: {
      accountId: detail.accountId,
      branchId: trDoc.branchId,
      departmentId: trDoc.departmentId,
      productIds: [detail.productId],
    },
    skip:
      !detail.productId ||
      !trDoc.branchId ||
      !trDoc.departmentId ||
      !detail.accountId ||
      (initProductId.current &&
        detail.productId === initProductId.current &&
        initBranchId.current &&
        trDoc.branchId === initBranchId.current &&
        initDepartmentId.current &&
        trDoc.departmentId === initDepartmentId.current &&
        initAccountId.current &&
        detail.accountId === initAccountId.current),
  });

  const [followTrDocs, setFollowTrDocs] = useAtom(followTrDocsState);

  useEffect(() => {
    const currIn = followTrDocs.find(
      (ftr) =>
        ftr.originId === trDoc._id &&
        ftr.followType === 'invMoveIn'
    );

    const commonFollowTr = {
      originId: trDoc._id,
      ptrId: trDoc.ptrId,
      parentId: trDoc.parentId,
    }

    const invMoveInTr: ITransaction = fixSumDtCt({
      ...currIn,
      ...commonFollowTr,
      _id: currIn?._id || getTempId(),
      journal: TrJournalEnum.INV_MOVE_IN,
      followType: 'invMoveIn',
      branchId: trDoc.followInfos.moveInBranchId,
      departmentId: trDoc.followInfos.moveInDepartmentId,
      details: (trDoc.details || []).map((moveDetail) => {
        const curInDetail = currIn?.details.find(inDetail => inDetail.originId === moveDetail._id);

        if (!curInDetail || moveDetail._id === detail._id) {
          return {
            ...moveDetail,
            ...curInDetail,
            productId: moveDetail.productId,
            account: trDoc.followExtras?.moveInAccount,
            accountId: trDoc.followInfos?.moveInAccountId,

            side: TR_SIDES.DEBIT,
            count: moveDetail.count,
            unitPrice: moveDetail.unitPrice,
            amount: moveDetail.amount,
          } as ITrDetail
        }
        return curInDetail;
      }),
    });

    setFollowTrDocs([
      ...(followTrDocs || []).filter(
        (ftr) =>
          !(
            ftr.originId === trDoc._id &&
            ['invMoveIn'].includes(ftr.followType || '')
          )
      ),
      invMoveInTr,
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  // 🚨 Unit price-г зөвхөн дараа нь өөрчлөгдсөн тохиолдолд шинэчилнэ
  useEffect(() => {
    if (loading || !currentCostInfo) return;

    const costInfo = currentCostInfo[detail.productId || ''];

    if (costInfo === undefined) return;

    form.setValue(getFieldName('unitPrice'), costInfo.unitCost);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.productId, loading]);

  const handleAmountChange = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    onChange(value);
    const newUnitPrice = count ? value / count : 0;
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
    calcAmount(count ?? 0, value);
    onChange(value);
  };

  const handleProduct = (
    productId: string,
    onChange: (productId: string) => void,
  ) => {
    onChange(productId);
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
                  // setMount(false)
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
              <Form.Item>
                <PopoverScoped
                  scope={`trDocs.${journalIndex}.details.${detailIndex}.productId`}
                  closeOnEnter
                >
                  <Form.Control>
                    <SelectProduct
                      value={field.value || ''}
                      onValueChange={(productId) => {
                        handleProduct(productId as string, field.onChange);
                      }}
                      variant="ghost"
                      scope={AccountingHotkeyScope.TransactionFormPage}
                    />
                  </Form.Control>
                  <Form.Message />
                </PopoverScoped>
              </Form.Item>
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
    </Table.Row>
  );
};
