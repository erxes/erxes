import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  cn,
  Form,
  Input,
  InputNumber,
  RecordTable,
  Sheet,
  Table,
  Tooltip,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import {
  ITransactionGroupForm,
  TFxaIncomeJournal,
} from '../../../types/JournalForms';
import { getTempId } from '../../utils';

type TFxaIncomeOwnerRecord = NonNullable<
  NonNullable<TFxaIncomeJournal['extraData']>['fxaOwnerRecords']
>[number];

const getDetailOwnerCount = (owners: TFxaIncomeOwnerRecord[]) =>
  owners.reduce(
    (sum, owner) => sum + Math.max(0, Math.trunc(owner.count || 0)),
    0,
  );

const normalizeOwnerRecords = (trDoc: TFxaIncomeJournal) => {
  const detailIds = new Set((trDoc.details || []).map((detail) => detail._id));

  return (trDoc.extraData?.fxaOwnerRecords || [])
    .filter((owner) => owner.transactionDetailId)
    .filter((owner) => detailIds.has(owner.transactionDetailId || ''))
    .map((owner) => {
      const detail = (trDoc.details || []).find(
        (item) => item._id === owner.transactionDetailId,
      );

      return {
        ...owner,
        transactionDetailId: owner.transactionDetailId || '',
        fixedAssetId: detail?.fixedAssetId || owner.fixedAssetId,
      };
    });
};

export const FxaIncomeOwnerRecordsSync = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TFxaIncomeJournal;

  useEffect(() => {
    const previousOwners = trDoc.extraData?.fxaOwnerRecords || [];
    const nextOwners = normalizeOwnerRecords(trDoc);

    if (JSON.stringify(previousOwners) !== JSON.stringify(nextOwners)) {
      form.setValue(
        `trDocs.${journalIndex}.extraData.fxaOwnerRecords`,
        nextOwners,
      );
    }
  }, [form, journalIndex, JSON.stringify(trDoc)]);

  return null;
};

export const FxaIncomeDetailOwnerRecordsSheet = ({
  form,
  journalIndex,
  detailIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  detailIndex: number;
}) => {
  const { t } = useTranslation('accounting');
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TFxaIncomeJournal;
  const detail = trDoc.details?.[detailIndex];
  const managedOwners = trDoc.extraData?.fxaOwnerRecords || [];
  const detailOwners = managedOwners
    .map((owner, ownerIndex) => ({ owner, ownerIndex }))
    .filter(({ owner }) => owner.transactionDetailId === detail?._id);
  const ownerCount = getDetailOwnerCount(
    detailOwners.map(({ owner }) => owner),
  );
  const detailCount = Math.max(0, Math.trunc(detail?.count || 0));
  const remainingCount = Math.max(0, detailCount - ownerCount);
  const title = [detail?.fixedAssetCode, detail?.fixedAssetName]
    .filter(Boolean)
    .join(' - ');
  const addButtonTip =
    remainingCount > 0
      ? t('unallocated-asset-quantity', { count: remainingCount })
      : t('the-allocated-quantity-matches-the-transaction-detail-quantity');

  const syncOwners = (nextOwners: TFxaIncomeOwnerRecord[]) => {
    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaOwnerRecords`,
      nextOwners.flatMap((owner) =>
        owner.transactionDetailId
          ? [{ ...owner, transactionDetailId: owner.transactionDetailId }]
          : [],
      ),
    );
  };

  const addOwner = () => {
    if (!detail || remainingCount <= 0) {
      return;
    }

    const sequence =
      Math.max(0, ...detailOwners.map(({ owner }) => owner.sequence || 0)) + 1;

    syncOwners([
      ...managedOwners,
      {
        tempId: `${detail._id}-${getTempId()}`,
        transactionDetailId: detail._id,
        fixedAssetId: detail.fixedAssetId,
        code: detail.fixedAssetCode
          ? `${detail.fixedAssetCode}_${String(sequence).padStart(3, '0')}`
          : '',
        sequence,
        count: remainingCount,
        ownerId: '',
      },
    ]);
  };

  const removeOwner = (ownerIndex: number) => {
    syncOwners(managedOwners.filter((_, index) => index !== ownerIndex));
  };

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <RecordTable.MoreButton
          type="button"
          className="w-8 p-0"
          disabled={!detail}
          aria-label={t('asset-custodian-records')}
          title={t('asset-custodian-records')}
        />
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-5xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b h-auto py-2">
          <div className="min-w-0">
            <Sheet.Title>{title || t('asset-custodian-records')}</Sheet.Title>
            <Sheet.Description>
              {t('quantity-label-2', { nsSeparator: false })} {detailCount}{' '}
              {t('allocated', { nsSeparator: false })} {ownerCount}{' '}
              {t('remaining', { nsSeparator: false })} {remainingCount}
            </Sheet.Description>
          </div>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span>
                <Button
                  type="button"
                  variant="secondary"
                  className={cn(
                    remainingCount > 0 &&
                      'border-destructive text-destructive hover:text-destructive',
                  )}
                  disabled={remainingCount <= 0}
                  onClick={addOwner}
                >
                  <IconPlus />
                  {t('add-allocation')}
                  {remainingCount})
                </Button>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>{addButtonTip}</Tooltip.Content>
          </Tooltip>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          {detail && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.details.${detailIndex}.followInfos.salvageValue`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('residual-value')}</Form.Label>
                    <Form.Control>
                      <InputNumber
                        value={field.value ?? 0}
                        onChange={(value) => field.onChange(value || 0)}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.details.${detailIndex}.followInfos.preDeprecation`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('prior-accumulated-depreciation')}
                    </Form.Label>
                    <Form.Control>
                      <InputNumber
                        value={field.value ?? 0}
                        onChange={(value) => field.onChange(value || 0)}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </div>
          )}
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>{t('code')}</Table.Head>
                <Table.Head>{t('quantity')}</Table.Head>
                <Table.Head>{t('asset-custodian')}</Table.Head>
                <Table.Head className="w-8" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {detailOwners.map(({ owner, ownerIndex }) => (
                <Table.Row key={owner.tempId || owner._id || ownerIndex}>
                  <Table.Cell>
                    <Form.Field
                      control={form.control}
                      name={`trDocs.${journalIndex}.extraData.fxaOwnerRecords.${ownerIndex}.code`}
                      render={({ field }) => (
                        <Input
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field
                      control={form.control}
                      name={`trDocs.${journalIndex}.extraData.fxaOwnerRecords.${ownerIndex}.count`}
                      render={({ field }) => (
                        <InputNumber
                          value={field.value ?? 0}
                          onChange={(value) => field.onChange(value || 0)}
                        />
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field
                      control={form.control}
                      name={`trDocs.${journalIndex}.extraData.fxaOwnerRecords.${ownerIndex}.ownerId`}
                      render={({ field }) => (
                        <SelectMember.FormItem
                          mode="single"
                          value={field.value}
                          onValueChange={(user) => field.onChange(user || '')}
                        />
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell className="w-8">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOwner(ownerIndex)}
                    >
                      <IconTrash />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
              {!detailOwners.length && (
                <Table.Row>
                  <Table.Cell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {t('no-asset-custodian-records-found')}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
