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
import { ITransactionGroupForm, TInvSaleJournal } from '../../../types/JournalForms';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { followTrDocsState, taxPercentsState } from '../../../states/trStates';
import { getTempId } from '../../utils';
import { TR_SIDES, TrJournalEnum } from '@/transactions/types/constants';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';

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
  }) as TInvSaleJournal;

  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  });

  const [followTrDocs, setFollowTrDocs] = useAtom(followTrDocsState);

  useEffect(() => {
    const currOut = followTrDocs.find(
      (ftr) =>
        ftr.originId === trDoc._id &&
        ftr.followType === 'invSaleOut'
    );
    const currCost = followTrDocs.find(
      (ftr) =>
        ftr.originId === trDoc._id &&
        ftr.followType === 'invSaleCost'
    );


    const invOutTr = {
      ...currOut,
      _id: currOut?._id || getTempId(),
      journal: TrJournalEnum.INV_SALE_OUT,
      originId: trDoc._id,
      ptrId: trDoc.ptrId,
      parentId: trDoc.parentId,
      followType: 'invSaleOut',
      details: (trDoc.details || []).map((saleDetail) => {
        const curOutDetail = currOut?.details.find(outDetail => outDetail.originId === saleDetail._id);

        if (saleDetail._id === detail._id || !curOutDetail) {
          return {
            ...saleDetail,
            ...curOutDetail,
            productId: saleDetail.productId,
            account: trDoc.followExtras?.saleOutAccount,
            accountId: trDoc.followInfos?.saleOutAccountId,
            side: TR_SIDES.CREDIT,
            amount: 0,
          } as ITrDetail
        }
        return curOutDetail;
      }),

      sumDt: 0,
      sumCt: 0,
    };
    const invCostTr: ITransaction = {
      ...currCost,
      _id: currCost?._id || getTempId(),
      journal: TrJournalEnum.INV_SALE_COST,
      originId: trDoc._id,
      ptrId: trDoc.ptrId,
      parentId: trDoc.parentId,
      followType: 'invSaleCost',
      details: (trDoc.details || []).map((saleDetail) => {
        const curCostDetail = currCost?.details.find(costDetail => costDetail.originId === saleDetail._id);

        if (saleDetail._id === detail._id || !curCostDetail) {
          return {
            ...saleDetail,
            ...curCostDetail,
            productId: saleDetail.productId,
            account: trDoc.followExtras?.saleCostAccount,
            accountId: trDoc.followInfos?.saleCostAccountId,
            side: TR_SIDES.DEBIT,
            amount: 0,
          } as ITrDetail
        }
        return curCostDetail;
      }),

      sumDt: 0,
      sumCt: 0,
    }

    setFollowTrDocs([
      ...(followTrDocs || []).filter(
        (ftr) =>
          !(
            ftr.originId === trDoc._id &&
            ['invSaleOut', 'invSaleCost'].includes(ftr.followType || '')
          )
      ),
      invOutTr,
      invCostTr,
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

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

  // 🚨 Unit price-г зөвхөн дараа нь өөрчлөгдсөн тохиолдолд шинэчилнэ
  useEffect(() => {
    if (loading || !currentCostInfo) return;

    const cost = currentCostInfo[detail.productId || ''];
    if (cost === undefined) return;

    form.setValue(getFieldName('unitPrice'), cost);

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
                defaultFilter={{ journals: [JournalEnum.MAIN] }}
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
                  handleProduct(productId as string, field.onChange);
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
