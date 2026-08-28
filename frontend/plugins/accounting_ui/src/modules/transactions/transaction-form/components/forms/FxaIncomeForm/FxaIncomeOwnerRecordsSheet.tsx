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

type TFxaIncomeOwnerRecord = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  ownerId?: string;
};

type TFxaIncomeDetailFollowInfo = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  salvageValue?: number;
  openingAccumulatedDepreciation?: number;
};

const getDetailOwnerCount = (owners: TFxaIncomeOwnerRecord[]) =>
  owners.reduce(
    (sum, owner) => sum + Math.max(0, Math.trunc(owner.count || 0)),
    0,
  );

const getDetailFollowInfo = (
  detailId: string,
  previous: TFxaIncomeDetailFollowInfo[],
) =>
  previous.find(
    (followInfo) =>
      followInfo.transactionDetailId === detailId ||
      followInfo.tempId === detailId,
  );

const buildDetailFollowInfos = (
  trDoc: TFxaIncomeJournal,
): TFxaIncomeDetailFollowInfo[] => {
  const previous = trDoc.followInfos?.fxaIncomeDetails || [];

  return (trDoc.details || []).map((detail) => {
    const previousInfo = getDetailFollowInfo(detail._id, previous);

    return {
      _id: previousInfo?._id,
      tempId: detail._id,
      transactionDetailId: detail._id,
      fixedAssetId: detail.fixedAssetId,
      salvageValue: previousInfo?.salvageValue || 0,
      openingAccumulatedDepreciation:
        previousInfo?.openingAccumulatedDepreciation || 0,
    };
  });
};

const normalizeOwnerRecords = (trDoc: TFxaIncomeJournal) => {
  const detailIds = new Set((trDoc.details || []).map((detail) => detail._id));

  return ((trDoc.extraData?.fxaOwnerRecords || []) as TFxaIncomeOwnerRecord[])
    .filter((owner) => owner.transactionDetailId)
    .filter((owner) => detailIds.has(owner.transactionDetailId || ''))
    .map((owner) => {
      const detail = (trDoc.details || []).find(
        (item) => item._id === owner.transactionDetailId,
      );

      return {
        ...owner,
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
    const previousFollowInfos = trDoc.followInfos?.fxaIncomeDetails || [];
    const nextFollowInfos = buildDetailFollowInfos(trDoc);

    if (JSON.stringify(previousOwners) !== JSON.stringify(nextOwners)) {
      form.setValue(
        `trDocs.${journalIndex}.extraData.fxaOwnerRecords`,
        nextOwners,
      );
    }

    if (JSON.stringify(previousFollowInfos) !== JSON.stringify(nextFollowInfos)) {
      form.setValue(
        `trDocs.${journalIndex}.followInfos.fxaIncomeDetails`,
        nextFollowInfos,
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
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TFxaIncomeJournal;
  const detail = trDoc.details?.[detailIndex];
  const managedOwners = (trDoc.extraData?.fxaOwnerRecords ||
    []) as TFxaIncomeOwnerRecord[];
  const detailOwners = managedOwners
    .map((owner, ownerIndex) => ({ owner, ownerIndex }))
    .filter(({ owner }) => owner.transactionDetailId === detail?._id);
  const followInfoIndex = (
    trDoc.followInfos?.fxaIncomeDetails || []
  ).findIndex(
    (followInfo) =>
      followInfo.transactionDetailId === detail?._id ||
      followInfo.tempId === detail?._id,
  );
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
      ? `Эд хариуцагчид оноогоогүй ${remainingCount} ширхэг байна.`
      : 'Оноосон тоо detail-ийн тоотой таарсан.';

  const syncOwners = (nextOwners: TFxaIncomeOwnerRecord[]) => {
    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaOwnerRecords`,
      nextOwners,
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
          className="w-10 p-0"
          disabled={!detail}
          aria-label="Эд хариуцагчийн бүртгэл"
          title="Эд хариуцагчийн бүртгэл"
        />
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-5xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <div className="min-w-0">
            <Sheet.Title>{title || 'Эд хариуцагчийн бүртгэл'}</Sheet.Title>
            <Sheet.Description>
              Тоо: {detailCount} | Оноосон: {ownerCount} | Үлдсэн:{' '}
              {remainingCount}
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
                  Instance нэмэх ({remainingCount})
                </Button>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>{addButtonTip}</Tooltip.Content>
          </Tooltip>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          {followInfoIndex >= 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Form.Field
                control={form.control}
                name={`trDocs.${journalIndex}.followInfos.fxaIncomeDetails.${followInfoIndex}.salvageValue`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Үлдэх өртөг</Form.Label>
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
                name={`trDocs.${journalIndex}.followInfos.fxaIncomeDetails.${followInfoIndex}.openingAccumulatedDepreciation`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Өмнөх хур. элэгдэл</Form.Label>
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
                <Table.Head>Код</Table.Head>
                <Table.Head>Тоо</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
                <Table.Head className="w-10" />
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
                  <Table.Cell>
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
                    Эд хариуцагчийн бүртгэл алга.
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
