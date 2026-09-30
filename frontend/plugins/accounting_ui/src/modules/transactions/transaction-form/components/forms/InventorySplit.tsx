import { useQuery } from '@apollo/client';
import {
  Checkbox,
  Form,
  InputNumber,
  PopoverScoped,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { fixNum } from 'erxes-ui/lib';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Path, useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { ITransaction, ITrDetail } from '../../../types/Transaction';
import { TR_SIDES, TrJournalEnum } from '../../../types/constants';
import { ACCOUNTING_INVENTORY_SPLIT_PRODUCTS } from '../../graphql/queries/invSplit';
import { followTrDocsState } from '../../states/trStates';
import {
  ITransactionGroupForm,
  TAddTransactionGroup,
  TInvIncomeJournal,
  TInvMoveJournal,
} from '../../types/JournalForms';
import { fixSumDtCt, getTempId } from '../utils';

const INV_SPLIT_OUT = 'invSplitOut';
const INV_SPLIT_INCOME = 'invSplitIncome';

type TSplitJournal = TInvIncomeJournal | TInvMoveJournal;
type TSplitInfo = NonNullable<
  NonNullable<TSplitJournal['followInfos']>['invSplitDetails']
>[number];

type TProductUom = {
  _id: string;
  uom?: string;
};

const splitInfosPath = (journalIndex: number): Path<TAddTransactionGroup> =>
  `trDocs.${journalIndex}.followInfos.invSplitDetails` as Path<TAddTransactionGroup>;

export const InventorySplitCells = ({
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
  }) as TSplitJournal;
  const detail = trDoc.details[detailIndex];
  const splitInfos = trDoc.followInfos?.invSplitDetails || [];
  const splitInfoIndex = splitInfos.findIndex(
    (splitInfo) => splitInfo.detailId === detail._id,
  );
  const splitInfo = splitInfos[splitInfoIndex];
  const productIds = [detail.productId, splitInfo?.productId].filter(
    (productId): productId is string => Boolean(productId),
  );
  const { data } = useQuery<{
    productsMain: { list: TProductUom[] };
  }>(ACCOUNTING_INVENTORY_SPLIT_PRODUCTS, {
    variables: { ids: productIds },
    skip: productIds.length === 0,
  });
  const uomByProductId = new Map(
    (data?.productsMain.list || []).map((product) => [
      product._id,
      product.uom,
    ]),
  );

  const setSplitInfos = (nextSplitInfos: TSplitInfo[]) => {
    form.setValue(splitInfosPath(journalIndex), nextSplitInfos, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setSplitInfos([
        ...splitInfos,
        { detailId: detail._id, productId: '', ratio: 1 },
      ]);
      return;
    }

    setSplitInfos(splitInfos.filter((split) => split.detailId !== detail._id));
  };

  return (
    <>
      <Table.Cell>
        <RecordTableInlineCell className="justify-center">
          <Checkbox
            checked={Boolean(splitInfo)}
            onCheckedChange={(checked) => handleCheckedChange(Boolean(checked))}
          />
        </RecordTableInlineCell>
      </Table.Cell>
      <Table.Cell>
        <RecordTableInlineCell>
          {uomByProductId.get(detail.productId) || '-'}
        </RecordTableInlineCell>
      </Table.Cell>
      <Table.Cell className="min-w-56">
        {splitInfo ? (
          <Form.Field
            control={form.control}
            name={
              `trDocs.${journalIndex}.followInfos.invSplitDetails.${splitInfoIndex}.productId` as Path<TAddTransactionGroup>
            }
            render={({ field }) => (
              <Form.Item>
                <Form.Control>
                  <SelectProduct
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    variant="ghost"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        ) : (
          <RecordTableInlineCell>-</RecordTableInlineCell>
        )}
      </Table.Cell>
      <Table.Cell>
        <RecordTableInlineCell>
          {splitInfo ? uomByProductId.get(splitInfo.productId) || '-' : '-'}
        </RecordTableInlineCell>
      </Table.Cell>
      <Table.Cell>
        {splitInfo ? (
          <Form.Field
            control={form.control}
            name={
              `trDocs.${journalIndex}.followInfos.invSplitDetails.${splitInfoIndex}.ratio` as Path<TAddTransactionGroup>
            }
            render={({ field }) => (
              <Form.Item>
                <PopoverScoped
                  scope={`trDocs.${journalIndex}.splitRatio.${detailIndex}`}
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
                      onChange={(value) => field.onChange(value || 0)}
                    />
                  </RecordTableInlineCell.Content>
                </PopoverScoped>
                <Form.Message />
              </Form.Item>
            )}
          />
        ) : (
          <RecordTableInlineCell>-</RecordTableInlineCell>
        )}
      </Table.Cell>
    </>
  );
};

const buildSplitDetails = (trDoc: TSplitJournal, splitInfos: TSplitInfo[]) => {
  const sourceDetailsById = new Map(
    trDoc.details.map((detail) => [detail._id, detail]),
  );
  const outDetails: ITrDetail[] = [];
  const incomeDetails: ITrDetail[] = [];
  const isMove = trDoc.journal === TrJournalEnum.INV_MOVE;

  splitInfos.forEach((splitInfo) => {
    const detail = sourceDetailsById.get(splitInfo.detailId);
    if (!detail || !splitInfo.productId || splitInfo.ratio <= 0) {
      return;
    }

    const count = detail.count ?? 0;
    const amount = detail.amount ?? count * (detail.unitPrice ?? 0);
    const sourceUnitPrice = count ? fixNum(amount / count, 4) : 0;
    const splitCount = fixNum(count * splitInfo.ratio, 4);
    const accountId = isMove
      ? trDoc.followInfos.moveInAccountId
      : detail.accountId;
    outDetails.push({
      _id: getTempId(),
      originId: detail._id,
      originType: INV_SPLIT_OUT,
      accountId,
      productId: detail.productId,
      count,
      unitPrice: sourceUnitPrice,
      amount,
    });
    incomeDetails.push({
      _id: getTempId(),
      originId: detail._id,
      originType: INV_SPLIT_INCOME,
      accountId,
      productId: splitInfo.productId,
      count: splitCount,
      unitPrice: splitCount ? fixNum(amount / splitCount, 4) : 0,
      amount,
    });
  });

  return { outDetails, incomeDetails };
};

export const InventorySplitSync = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TSplitJournal;
  const setFollowTrDocs = useSetAtom(followTrDocsState);
  const splitInfos = trDoc.followInfos?.invSplitDetails || [];
  const splitSignature = JSON.stringify({
    splitInfos,
    details: trDoc.details.map((detail) => ({
      _id: detail._id,
      accountId: detail.accountId,
      productId: detail.productId,
      count: detail.count,
      unitPrice: detail.unitPrice,
      amount: detail.amount,
    })),
    moveInAccountId:
      trDoc.journal === TrJournalEnum.INV_MOVE
        ? trDoc.followInfos.moveInAccountId
        : undefined,
    moveInBranchId:
      trDoc.journal === TrJournalEnum.INV_MOVE
        ? trDoc.followInfos.moveInBranchId
        : undefined,
    moveInDepartmentId:
      trDoc.journal === TrJournalEnum.INV_MOVE
        ? trDoc.followInfos.moveInDepartmentId
        : undefined,
  });
  const { outDetails, incomeDetails } = useMemo(
    () => buildSplitDetails(trDoc, splitInfos),
    [splitSignature],
  );

  useEffect(() => {
    setFollowTrDocs((previous) => {
      const existingOut = previous.find(
        (transaction) =>
          transaction.originId === trDoc._id &&
          transaction.originType === INV_SPLIT_OUT,
      );
      const existingIncome = previous.find(
        (transaction) =>
          transaction.originId === trDoc._id &&
          transaction.originType === INV_SPLIT_INCOME,
      );
      const next = previous.filter(
        (transaction) =>
          !(
            transaction.originId === trDoc._id &&
            [INV_SPLIT_OUT, INV_SPLIT_INCOME].includes(
              transaction.originType || '',
            )
          ),
      );

      if (!outDetails.length) {
        return next;
      }

      const isMove = trDoc.journal === TrJournalEnum.INV_MOVE;
      const branchId = isMove
        ? trDoc.followInfos.moveInBranchId
        : trDoc.branchId;
      const departmentId = isMove
        ? trDoc.followInfos.moveInDepartmentId
        : trDoc.departmentId;
      const common = {
        originId: trDoc._id,
        ptrId: trDoc.ptrId,
        parentId: trDoc.parentId,
        branchId,
        departmentId,
      };
      const outTransaction = fixSumDtCt({
        ...existingOut,
        ...common,
        _id: existingOut?._id || getTempId(),
        journal: TrJournalEnum.INV_OUT,
        side: TR_SIDES.CREDIT,
        originType: INV_SPLIT_OUT,
        details: outDetails,
      } as ITransaction);
      const incomeTransaction = fixSumDtCt({
        ...existingIncome,
        ...common,
        _id: existingIncome?._id || getTempId(),
        journal: TrJournalEnum.INV_INCOME,
        side: TR_SIDES.DEBIT,
        originType: INV_SPLIT_INCOME,
        details: incomeDetails,
      } as ITransaction);

      return [...next, outTransaction, incomeTransaction];
    });
  }, [
    departmentIdForEffect(trDoc),
    incomeDetails,
    outDetails,
    setFollowTrDocs,
    trDoc._id,
    trDoc.branchId,
    trDoc.departmentId,
    trDoc.journal,
    trDoc.parentId,
    trDoc.ptrId,
  ]);

  return null;
};

const departmentIdForEffect = (trDoc: TSplitJournal) =>
  trDoc.journal === TrJournalEnum.INV_MOVE
    ? `${trDoc.followInfos.moveInBranchId || ''}:${
        trDoc.followInfos.moveInDepartmentId || ''
      }`
    : '';
