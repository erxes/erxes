import { useQuery } from '@apollo/client';
import {
  Checkbox,
  cn,
  Form,
  Input,
  InputNumber,
  Label,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
} from 'erxes-ui';
import { fixNum } from 'erxes-ui/lib';
import { useSetAtom } from 'jotai';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
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

const INV_SPLIT_OUT_ORIGIN_TYPE = 'invSplitOut';
const INV_SPLIT_INCOME_ORIGIN_TYPE = 'invSplitIncome';

type TSplitJournal = TInvIncomeJournal | TInvMoveJournal;
type TSplitInfo = NonNullable<
  NonNullable<TSplitJournal['details'][number]['followInfos']>['invSplit']
>;

type TProductUom = {
  _id: string;
  uom?: string;
};

const InventorySplitUomContext = createContext<ReadonlyMap<string, string>>(
  new Map(),
);

export const InventorySplitProvider = ({
  children,
  form,
  journalIndex,
}: {
  children: ReactNode;
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TSplitJournal;
  const productIds = useMemo(
    () =>
      Array.from(
        new Set(
          trDoc.details.flatMap((detail) => [
            detail.productId,
            detail.followInfos?.invSplit?.productId,
          ]),
        ),
      ).filter((productId): productId is string => Boolean(productId)),
    [trDoc.details],
  );
  const { data } = useQuery<{
    productsMain: { list: TProductUom[] };
  }>(ACCOUNTING_INVENTORY_SPLIT_PRODUCTS, {
    variables: { ids: productIds },
    skip: productIds.length === 0,
  });
  const uomByProductId = useMemo(
    () =>
      new Map(
        (data?.productsMain.list || []).map((product) => [
          product._id,
          product.uom || '',
        ]),
      ),
    [data?.productsMain.list],
  );

  return (
    <InventorySplitUomContext.Provider value={uomByProductId}>
      {children}
      <InventorySplitSync form={form} journalIndex={journalIndex} />
    </InventorySplitUomContext.Provider>
  );
};

export const InventorySplitSheet = ({
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
  const splitInfo = detail.followInfos?.invSplit;
  const hasSplit = splitInfo?.hasSplit === true;
  const splitPath =
    `trDocs.${journalIndex}.details.${detailIndex}.followInfos.invSplit` as Path<TAddTransactionGroup>;
  const splitProductPath =
    `${splitPath}.productId` as Path<TAddTransactionGroup>;
  const splitRatioPath = `${splitPath}.ratio` as Path<TAddTransactionGroup>;
  const uomByProductId = useContext(InventorySplitUomContext);

  const setSplitInfo = (nextSplitInfo?: TSplitInfo) => {
    form.setValue(splitPath, nextSplitInfo, {
      shouldDirty: true,
      shouldValidate: nextSplitInfo?.hasSplit !== true,
    });
  };

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setSplitInfo({
        hasSplit: true,
        productId: splitInfo?.productId || '',
        ratio: splitInfo?.ratio ?? 1,
      });
      return;
    }

    setSplitInfo({
      ...splitInfo,
      hasSplit: false,
    });
  };

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <RecordTable.MoreButton
          type="button"
          className={cn(
            'w-8 p-0',
            hasSplit &&
              'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20',
          )}
          disabled={!detail}
          aria-label="Бараа задлах тохиргоо"
          title="Бараа задлах тохиргоо"
        />
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none sm:max-w-lg">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <div className="min-w-0 flex-1">
            <Sheet.Title>Бараа задлах</Sheet.Title>
            <Sheet.Description>Задрах барааны тохиргоо</Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <Label htmlFor={`inventory-split-${detail._id}`}>Задлах эсэх</Label>
            <Checkbox
              id={`inventory-split-${detail._id}`}
              checked={hasSplit}
              onCheckedChange={(checked) =>
                handleCheckedChange(Boolean(checked))
              }
            />
          </div>

          {hasSplit && (
            <div className="grid gap-4">
              <Form.Field
                control={form.control}
                name={splitProductPath}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Задрах бараа</Form.Label>
                    <Form.Control>
                      <SelectProduct
                        value={field.value || ''}
                        onValueChange={(productId) =>
                          form.setValue(splitProductPath, productId, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name={splitRatioPath}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Задрах харьцаа</Form.Label>
                    <Form.Control>
                      <InputNumber
                        value={field.value ?? 0}
                        onChange={(value) =>
                          form.setValue(splitRatioPath, value || 0, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="space-y-2">
                <Label>Задрах барааны хэмжих нэгж</Label>
                <Input
                  value={uomByProductId.get(splitInfo.productId) || '-'}
                  readOnly
                />
              </div>
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const InventorySourceUom = ({ productId }: { productId?: string }) => {
  const uomByProductId = useContext(InventorySplitUomContext);

  return (
    <RecordTableInlineCell>
      {(productId && uomByProductId.get(productId)) || '-'}
    </RecordTableInlineCell>
  );
};

const withStableDetailIds = (
  details: ITrDetail[],
  currentTransaction?: ITransaction,
) =>
  details.map((detail) => ({
    ...detail,
    _id:
      currentTransaction?.details.find(
        (currentDetail) => currentDetail.originId === detail.originId,
      )?._id || getTempId(),
  }));

const buildSplitDetails = (trDoc: TSplitJournal) => {
  const outDetails: ITrDetail[] = [];
  const incomeDetails: ITrDetail[] = [];
  const isMove = trDoc.journal === TrJournalEnum.INV_MOVE;

  trDoc.details.forEach((detail) => {
    const splitInfo = detail.followInfos?.invSplit;
    if (!splitInfo?.hasSplit || !splitInfo.productId || splitInfo.ratio <= 0) {
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
      originId: detail._id,
      originType: INV_SPLIT_OUT_ORIGIN_TYPE,
      accountId,
      productId: detail.productId,
      count,
      unitPrice: sourceUnitPrice,
      amount,
    });
    incomeDetails.push({
      originId: detail._id,
      originType: INV_SPLIT_INCOME_ORIGIN_TYPE,
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
  const { outDetails, incomeDetails } = useMemo(
    () => buildSplitDetails(trDoc),
    [trDoc],
  );
  const isMove = trDoc.journal === TrJournalEnum.INV_MOVE;
  const originId = trDoc._id;
  const branchId = isMove ? trDoc.followInfos.moveInBranchId : trDoc.branchId;
  const departmentId = isMove
    ? trDoc.followInfos.moveInDepartmentId
    : trDoc.departmentId;
  const { parentId, ptrId } = trDoc;

  useEffect(() => {
    setFollowTrDocs((previous) => {
      const existingOut = previous.find(
        (transaction) =>
          transaction.originId === originId &&
          transaction.originType === INV_SPLIT_OUT_ORIGIN_TYPE,
      );
      const existingIncome = previous.find(
        (transaction) =>
          transaction.originId === originId &&
          transaction.originType === INV_SPLIT_INCOME_ORIGIN_TYPE,
      );
      const next = previous.filter(
        (transaction) =>
          !(
            transaction.originId === originId &&
            [INV_SPLIT_OUT_ORIGIN_TYPE, INV_SPLIT_INCOME_ORIGIN_TYPE].includes(
              transaction.originType || '',
            )
          ),
      );

      if (!outDetails.length) {
        return next;
      }

      const splitPtrId =
        [existingOut, existingIncome].find(
          (transaction) => transaction?.ptrId && transaction.ptrId !== ptrId,
        )?.ptrId || getTempId();
      const common = {
        originId,
        ptrId: splitPtrId,
        parentId,
        branchId,
        departmentId,
      };
      const outTransaction = fixSumDtCt({
        ...existingOut,
        ...common,
        _id: existingOut?._id || getTempId(),
        journal: TrJournalEnum.INV_OUT,
        side: TR_SIDES.CREDIT,
        originType: INV_SPLIT_OUT_ORIGIN_TYPE,
        details: withStableDetailIds(outDetails, existingOut),
      } as ITransaction);
      const incomeTransaction = fixSumDtCt({
        ...existingIncome,
        ...common,
        _id: existingIncome?._id || getTempId(),
        journal: TrJournalEnum.INV_INCOME,
        side: TR_SIDES.DEBIT,
        originType: INV_SPLIT_INCOME_ORIGIN_TYPE,
        details: withStableDetailIds(incomeDetails, existingIncome),
      } as ITransaction);

      return [...next, outTransaction, incomeTransaction];
    });
  }, [
    branchId,
    departmentId,
    incomeDetails,
    originId,
    outDetails,
    parentId,
    ptrId,
    setFollowTrDocs,
  ]);

  return null;
};
