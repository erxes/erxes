import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_SIDES, TrJournalEnum } from '@/transactions/types/constants';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  Checkbox,
  cn,
  CurrencyField,
  fixNum,
  Form,
  InputNumber,
  PopoverScoped,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import { useGetAccCurrentCost } from '../../../hooks/useGetInvCostInfo';
import {
  followTrDocsState,
  showAdvancedViewState,
  taxPercentsState,
} from '../../../states/trStates';
import {
  ITransactionGroupForm,
  TInvSaleJournal,
} from '../../../types/JournalForms';
import { fixSumDtCt, getTempId } from '../../utils';

const findFollowTr = (
  followTrDocs: ITransaction[],
  originId: string,
  originType: string,
) =>
  followTrDocs.find(
    (ftr) => ftr.originId === originId && ftr.originType === originType,
  );

const findFollowDetail = (details: ITrDetail[] = [], originId?: string) =>
  details.find((detail) => detail.originId === originId);

const buildSaleReturnFollowDetails = ({
  account,
  accountId,
  activeDetail,
  currentTr,
  trDoc,
  unitCost,
}: {
  account?: any;
  accountId?: string;
  activeDetail: ITrDetail;
  currentTr?: ITransaction;
  trDoc: TInvSaleJournal;
  unitCost: number;
}) =>
  (trDoc.details || []).map((saleDetail) => {
    const currentDetail = findFollowDetail(currentTr?.details, saleDetail._id);

    if (currentDetail && saleDetail._id !== activeDetail._id) {
      return currentDetail;
    }

    return {
      ...saleDetail,
      ...currentDetail,
      productId: saleDetail.productId,
      account,
      accountId,
      unitPrice: unitCost,
      count: activeDetail.count,
      amount: fixNum(unitCost * (activeDetail.count ?? 0)),
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
  const showAdvancedView = useAtomValue(showAdvancedViewState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvSaleJournal;

  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });

  const followTrDocs = useAtomValue(followTrDocsState);
  const setFollowTrDocs = useSetAtom(followTrDocsState);

  const { unitPrice, count, _id } = detail;

  const initProductId = useRef(detail.productId);
  const initOutAccountId = useRef(trDoc.followInfos?.saleOutAccountId);
  const initBranchId = useRef(trDoc.branchId);
  const initDepartmentId = useRef(trDoc.departmentId);
  const [unitCost, setUnitCost] = useState(
    followTrDocs
      .find(
        (ftr) =>
          ftr.originId === trDoc._id && ftr.originType === 'invSaleReturnOut',
      )
      ?.details.find((fd) => fd.originId === detail._id)?.unitPrice ?? 0,
  );

  const getFieldName = (name: string) => {
    return `trDocs.${journalIndex}.details.${detailIndex}.${name}` as any;
  };

  useEffect(() => {
    setFollowTrDocs((prev) => {
      const currOut = findFollowTr(prev || [], trDoc._id, 'invSaleReturnOut');
      const currCost = findFollowTr(prev || [], trDoc._id, 'invSaleReturnCost');

      const ptrId = currOut?.ptrId || currCost?.ptrId || getTempId();

      const commonFollowTr = {
        originId: trDoc._id,
        ptrId,
        parentId: trDoc.parentId,
      };

      const invOutTr = fixSumDtCt({
        ...currOut,
        ...commonFollowTr,
        _id: currOut?._id || getTempId(),
        journal: TrJournalEnum.INV_SALE_RETURN_OUT,
        side: TR_SIDES.DEBIT,
        originType: 'invSaleReturnOut',
        details: buildSaleReturnFollowDetails({
          account: trDoc.followExtras?.saleOutAccount,
          accountId: trDoc.followInfos?.saleOutAccountId,
          activeDetail: detail as ITrDetail,
          currentTr: currOut,
          trDoc,
          unitCost,
        }),
      });

      const invCostTr = fixSumDtCt({
        ...currCost,
        ...commonFollowTr,
        _id: currCost?._id || getTempId(),
        journal: TrJournalEnum.INV_SALE_RETURN_COST,
        side: TR_SIDES.CREDIT,
        originType: 'invSaleReturnCost',
        details: buildSaleReturnFollowDetails({
          account: trDoc.followExtras?.saleCostAccount,
          accountId: trDoc.followInfos?.saleCostAccountId,
          activeDetail: detail as ITrDetail,
          currentTr: currCost,
          trDoc,
          unitCost,
        }),
      });

      return [
        ...(prev || []).filter(
          (ftr) =>
            !(
              ftr.originId === trDoc._id &&
              ['invSaleReturnOut', 'invSaleReturnCost'].includes(
                ftr.originType || '',
              )
            ),
        ),
        invOutTr,
        invCostTr,
      ];
    });
  }, [
    detail,
    unitCost,
    trDoc._id,
    trDoc.parentId,
    trDoc.details,
    trDoc.followExtras?.saleCostAccount,
    trDoc.followExtras?.saleOutAccount,
    trDoc.followInfos?.saleCostAccountId,
    trDoc.followInfos?.saleOutAccountId,
    setFollowTrDocs,
  ]);

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

  const { currentCostInfo, loading } = useGetAccCurrentCost({
    variables: {
      accountId: trDoc.followInfos?.saleOutAccountId,
      branchId: trDoc.branchId,
      departmentId: trDoc.departmentId,
      productIds: [detail.productId],
    },
    skip:
      !detail.productId ||
      !trDoc.branchId ||
      !trDoc.departmentId ||
      !trDoc.followInfos?.saleOutAccountId ||
      (initProductId.current &&
        detail.productId === initProductId.current &&
        initBranchId.current &&
        trDoc.branchId === initBranchId.current &&
        initDepartmentId.current &&
        trDoc.departmentId === initDepartmentId.current &&
        initOutAccountId.current &&
        trDoc.followInfos?.saleOutAccountId === initOutAccountId.current),
  });

  // 🚨 Unit price-г зөвхөн дараа нь өөрчлөгдсөн тохиолдолд шинэчилнэ
  useEffect(() => {
    if (loading || !currentCostInfo) return;

    const costInfo = currentCostInfo[detail.productId || ''];
    if (costInfo === undefined) return;

    setUnitCost(fixNum(costInfo.unitCost ?? 0));

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

  const handleTaxValueChange = (key: string, value: number) => {
    const amountWithTax = key === 'amount' ? value : value * (count ?? 0);
    const unitPriceWithTax = key === 'amount' ? value / (count ?? 1) : value;

    setTaxAmounts({ unitPriceWithTax, amountWithTax });

    form.setValue(
      getFieldName('unitPrice'),
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
                defaultFilter={{ journals: [JournalEnum.MAIN] }}
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
                <Form.Message />
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
                <Form.Message />
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

      {trDoc.hasVat && (
        <RecordTableHotKeyControl
          rowId={_id}
          rowIndex={detailIndex}
          enableOnFormTags
        >
          <Table.Cell>
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
        <RecordTableHotKeyControl
          rowId={_id}
          rowIndex={detailIndex}
          enableOnFormTags
        >
          <Table.Cell>
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
          <RecordTableHotKeyControl
            rowId={_id}
            rowIndex={detailIndex}
            enableOnFormTags
          >
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

          <RecordTableHotKeyControl
            rowId={_id}
            rowIndex={detailIndex}
            enableOnFormTags
          >
            <Table.Cell>
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
