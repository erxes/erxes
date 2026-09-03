import { useQuery } from '@apollo/client';
import { Checkbox, InputNumber, RecordTable, Sheet, Table, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { FXA_OWNER_RECORDS_QUERY } from '../../graphql/queries/fixedAssets';
import { ITransactionGroupForm, TFxaDetail } from '../../types/JournalForms';
import { getTempId } from '../utils';

type TFxaOwnerRecordInput = {
  _id?: string;
  fxaOwnerRecordId?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  ownerId?: string;
};

type TFxaOwnerRecord = {
  _id: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  action?: string;
  status?: string;
  ownerId?: string;
};

type TFxaOwnerRecordsQueryData = {
  fxaOwnerRecords: TFxaOwnerRecord[];
};

const getRecordCurrentCount = (record: TFxaOwnerRecord) =>
  Math.max(0, Math.trunc(record.count ?? 0));

const getInputCount = (record: TFxaOwnerRecordInput) =>
  Math.max(0, Math.trunc(record.count || 0));

const getRecordOwnerId = (record: TFxaOwnerRecord) => record.ownerId || '';

const getInputOwnerRecordId = (record: TFxaOwnerRecordInput) =>
  record.fxaOwnerRecordId || record._id || '';

export const FxaOwnerRecordsSheet = ({
  form,
  journalIndex,
  detailIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  detailIndex: number;
}) => {
  const detail = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.${detailIndex}`,
  }) as TFxaDetail | undefined;
  const ownerRecords =
    (useWatch({
      control: form.control,
      name: `trDocs.${journalIndex}.extraData.fxaOwnerRecords`,
    }) as TFxaOwnerRecordInput[] | undefined) || [];
  const detailCount = Math.max(0, Math.trunc(detail?.count || 0));
  const detailId = detail?._id || '';
  const detailOwnerRecords = ownerRecords.filter(
    (record) => record.transactionDetailId === detailId,
  );
  const selectedCount = detailOwnerRecords.reduce(
    (sum, record) => sum + getInputCount(record),
    0,
  );
  const remainingCount = Math.max(0, detailCount - selectedCount);
  const { data, loading } = useQuery<TFxaOwnerRecordsQueryData>(
    FXA_OWNER_RECORDS_QUERY,
    {
      variables: {
        fixedAssetIds: detail?.fixedAssetId ? [detail.fixedAssetId] : [],
        status: 'active',
        balanceOnly: true,
      },
      skip: !detail?.fixedAssetId,
    },
  );
  const activeRecords = (data?.fxaOwnerRecords || []).filter(
    (record) => getRecordCurrentCount(record) > 0,
  );
  const title = [detail?.fixedAssetCode, detail?.fixedAssetName]
    .filter(Boolean)
    .join(' - ');
  const isWithinLimit = selectedCount <= detailCount;

  const syncRecords = (nextRecords: TFxaOwnerRecordInput[]) => {
    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaOwnerRecords`,
      nextRecords,
    );
  };

  const findSelectedRecord = (recordId: string) =>
    ownerRecords.find(
      (record) =>
        record.transactionDetailId === detailId &&
        getInputOwnerRecordId(record) === recordId,
    );

  const updateRecordCount = (recordId: string, count: number) => {
    syncRecords(
      ownerRecords.map((record) =>
        record.transactionDetailId === detailId &&
        getInputOwnerRecordId(record) === recordId
          ? { ...record, count }
          : record,
      ),
    );
  };

  const removeRecord = (recordId: string) => {
    syncRecords(
      ownerRecords.filter(
        (record) =>
          record.transactionDetailId !== detailId ||
          getInputOwnerRecordId(record) !== recordId,
      ),
    );
  };

  const addRecord = (record: TFxaOwnerRecord) => {
    if (!detail || !detailId || remainingCount <= 0) {
      return;
    }

    const currentCount = getRecordCurrentCount(record);
    const count = Math.min(currentCount, remainingCount);

    syncRecords([
      ...ownerRecords,
      {
        tempId: `${detailId}-${record._id}-${getTempId()}`,
        fxaOwnerRecordId: record._id,
        transactionDetailId: detailId,
        fixedAssetId: detail.fixedAssetId,
        code: record.code,
        sequence: record.sequence,
        count,
        ownerId: getRecordOwnerId(record),
      },
    ]);
  };

  const toggleRecord = (record: TFxaOwnerRecord, checked: boolean) => {
    if (checked) {
      addRecord(record);
      return;
    }

    removeRecord(record._id);
  };

  useEffect(() => {
    const nextRecords = ownerRecords.filter((record) => {
      if (record.transactionDetailId !== detailId) {
        return true;
      }

      return record.fixedAssetId === detail?.fixedAssetId;
    });

    if (JSON.stringify(nextRecords) !== JSON.stringify(ownerRecords)) {
      syncRecords(nextRecords);
    }
  }, [detail?.fixedAssetId, detailId]);

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <RecordTable.MoreButton
          type="button"
          className="w-10 p-0"
          disabled={!detail?.fixedAssetId || detailCount <= 0}
          aria-label="Эд хариуцагч сонгох"
          title="Эд хариуцагч сонгох"
        />
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-5xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <div className="min-w-0">
            <Sheet.Title>{title || 'Эд хариуцагч сонгох'}</Sheet.Title>
            <Sheet.Description
              className={cn(!isWithinLimit && 'text-destructive')}
            >
              Дээд тоо: {detailCount} | Сонгосон: {selectedCount} | Боломжит:{' '}
              {remainingCount}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-10" />
                <Table.Head>Код</Table.Head>
                <Table.Head>Боломжит тоо</Table.Head>
                <Table.Head>Сонгох тоо</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {activeRecords.map((record) => {
                const selectedRecord = findSelectedRecord(record._id);
                const selectedRecordCount = getInputCount(selectedRecord || {});
                const availableCount = getRecordCurrentCount(record);
                const selected = Boolean(selectedRecord);

                return (
                  <Table.Row key={record._id}>
                    <Table.Cell>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selected}
                          disabled={!selected && remainingCount <= 0}
                          onCheckedChange={(checked) =>
                            toggleRecord(record, Boolean(checked))
                          }
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell>{record.code || '-'}</Table.Cell>
                    <Table.Cell>{availableCount}</Table.Cell>
                    <Table.Cell>
                      <InputNumber
                        value={selectedRecordCount}
                        disabled={!selected}
                        onChange={(value) => {
                          const nextCount = Math.min(
                            Math.max(0, Math.trunc(value || 0)),
                            availableCount,
                            selectedRecordCount + Math.max(0, remainingCount),
                          );

                          if (nextCount <= 0) {
                            removeRecord(record._id);
                            return;
                          }

                          updateRecordCount(record._id, nextCount);
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <SelectMember.Provider
                        mode="single"
                        value={getRecordOwnerId(record)}
                      >
                        <SelectMember.Value placeholder="-" />
                      </SelectMember.Provider>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              {!activeRecords.length && (
                <Table.Row>
                  <Table.Cell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    {loading
                      ? 'Уншиж байна...'
                      : 'Идэвхтэй эд хариуцагчийн бүртгэл алга.'}
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
