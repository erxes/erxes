import { useGetAccCurrentCost } from '../../../hooks/useGetInvCostInfo';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  cn,
  Form,
  InputNumber,
  RecordTableInlineCell,
  RecordTableHotKeyControl,
  PopoverScoped,
  Table,
} from 'erxes-ui';
import { FieldPath, useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import {
  ITransactionGroupForm,
  TAddTransactionGroup,
  TInvDetail,
  TInvMoveJournal,
} from '../../../types/JournalForms';
import { useEffect } from 'react';
import {
  DUPLICATE_PRODUCT_CELL_CLASS,
  fixSumDtCt,
  getTempId,
  hasDuplicateProductId,
} from '../../utils';
import {
  ITransaction,
  ITrDetail,
} from '~/modules/transactions/types/Transaction';
import {
  TR_SIDES,
  TrJournalEnum,
} from '~/modules/transactions/types/constants';
import { useAtomValue, useSetAtom } from 'jotai';
import { followTrDocsState } from '../../../states/trStates';

const getFollowDetail = (details: ITrDetail[] = [], originId?: string) =>
  details.find((detail) => detail.originId === originId);

const buildInvMoveInDetails = ({
  currIn,
  trDoc,
}: {
  currIn?: ITransaction;
  trDoc: TInvMoveJournal;
}) =>
  (trDoc.details || []).map((moveDetail) => {
    const curInDetail = getFollowDetail(currIn?.details, moveDetail._id);

    return {
      ...moveDetail,
      ...curInDetail,
      originId: moveDetail._id,
      productId: moveDetail.productId,
      account: trDoc.followExtras?.moveInAccount,
      accountId: trDoc.followInfos?.moveInAccountId,
      count: moveDetail.count,
      unitPrice: moveDetail.unitPrice,
      amount: moveDetail.amount,
    } as ITrDetail;
  });

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
  const hasDuplicateProduct = hasDuplicateProductId(
    trDoc.details,
    detail.productId,
  );

  const { unitPrice, count, _id } = detail;

  const getFieldName = (name: keyof TInvDetail) => {
    return `trDocs.${journalIndex}.details.${detailIndex}.${name}` as FieldPath<TAddTransactionGroup>;
  };

  const followTrDocs = useAtomValue(followTrDocsState);
  const moveInTransaction = followTrDocs.find(
    (transaction) =>
      transaction.originId === trDoc._id &&
      transaction.originType === TrJournalEnum.INV_MOVE_IN,
  );
  const excludedTransactionIds = [trDoc._id, moveInTransaction?._id].filter(
    (transactionId): transactionId is string => Boolean(transactionId),
  );

  const { currentCostInfo, loading } = useGetAccCurrentCost({
    variables: {
      accountId: detail.accountId,
      branchId: detail.branchId || trDoc.branchId,
      departmentId: detail.departmentId || trDoc.departmentId,
      productIds: [detail.productId],
      excludedTransactionIds,
    },
    skip: !detail.productId || !detail.accountId,
  });

  const setFollowTrDocs = useSetAtom(followTrDocsState);

  useEffect(() => {
    setFollowTrDocs((prev) => {
      const currIn = (prev || []).find(
        (ftr) => ftr.originId === trDoc._id && ftr.originType === 'invMoveIn',
      );

      const invMoveInTr = fixSumDtCt({
        ...currIn,
        originId: trDoc._id,
        ptrId: trDoc.ptrId,
        parentId: trDoc.parentId,
        _id: currIn?._id || getTempId(),
        journal: TrJournalEnum.INV_MOVE_IN,
        side: TR_SIDES.DEBIT,
        originType: 'invMoveIn',
        branchId: trDoc.followInfos.moveInBranchId,
        departmentId: trDoc.followInfos.moveInDepartmentId,
        details: buildInvMoveInDetails({
          currIn,
          trDoc,
        }),
      });

      return [
        ...(prev || []).filter(
          (ftr) =>
            !(ftr.originId === trDoc._id && ftr.originType === 'invMoveIn'),
        ),
        invMoveInTr,
      ];
    });
  }, [
    detail,
    trDoc._id,
    trDoc.ptrId,
    trDoc.parentId,
    trDoc.details,
    trDoc.followExtras?.moveInAccount,
    trDoc.followInfos.moveInAccountId,
    trDoc.followInfos.moveInBranchId,
    trDoc.followInfos.moveInDepartmentId,
    setFollowTrDocs,
  ]);

  useEffect(() => {
    if (loading || !currentCostInfo) return;

    const costInfo = currentCostInfo[detail.productId || ''];
    const nextUnitPrice = costInfo?.unitCost ?? 0;

    form.setValue(getFieldName('unitPrice'), nextUnitPrice);
    form.setValue(getFieldName('amount'), (count ?? 0) * nextUnitPrice);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCostInfo, detail.productId, loading]);

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
              <Form.Item>
                <PopoverScoped
                  scope={`trDocs.${journalIndex}.details.${detailIndex}.productId`}
                  closeOnEnter
                >
                  <Form.Control>
                    <SelectProduct
                      value={field.value || ''}
                      onValueChange={(productId) =>
                        field.onChange(productId as string)
                      }
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
    </Table.Row>
  );
};
