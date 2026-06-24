import { useQuery } from '@apollo/client';
import { Form, Input, InputNumber, RecordTable, Sheet, Table } from 'erxes-ui';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import {
  FIXED_ASSETS_QUERY,
  FXA_INSTANCES_QUERY,
} from '../../../graphql/queries/fixedAssets';
import {
  ITransactionGroupForm,
  TFxaIncomeJournal,
} from '../../../types/JournalForms';

type TFixedAsset = {
  _id: string;
  code?: string;
  name?: string;
};

type TExistingInstance = {
  fixedAssetId: string;
  code: string;
};

type TFxaIncomeInstance = {
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId: string;
  code: string;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  locationId?: string;
  originalCost?: number;
};

const getCodeSequence = (code: string, assetCode: string) => {
  const escapedAssetCode = assetCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^${escapedAssetCode}_(\\d+)$`).exec(code);

  return match ? Number(match[1]) : 0;
};

export const FxaIncomeInstancesSync = ({
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
  const fixedAssetIds = Array.from(
    new Set(
      (trDoc.details || [])
        .map((detail) => detail.fixedAssetId)
        .filter(Boolean),
    ),
  );
  const { data: fixedAssetsData } = useQuery<{ fixedAssets: TFixedAsset[] }>(
    FIXED_ASSETS_QUERY,
    {
      variables: { ids: fixedAssetIds, limit: fixedAssetIds.length },
      skip: !fixedAssetIds.length,
    },
  );
  const { data: instancesData } = useQuery<{
    fxaInstances: TExistingInstance[];
  }>(FXA_INSTANCES_QUERY, {
    variables: { fixedAssetIds },
    skip: !fixedAssetIds.length,
  });

  useEffect(() => {
    const previous = trDoc.extraData?.fxaInstances || [];
    const fixedAssetsById = new Map(
      (fixedAssetsData?.fixedAssets || []).map((asset) => [asset._id, asset]),
    );
    const nextSequenceByAsset = new Map<string, number>();

    for (const instance of [
      ...(instancesData?.fxaInstances || []),
      ...previous,
    ]) {
      const assetCode = fixedAssetsById.get(instance.fixedAssetId)?.code;

      if (!assetCode) {
        continue;
      }

      nextSequenceByAsset.set(
        instance.fixedAssetId,
        Math.max(
          nextSequenceByAsset.get(instance.fixedAssetId) || 0,
          getCodeSequence(instance.code || '', assetCode),
        ),
      );
    }

    const next = (trDoc.details || []).flatMap((detail) =>
      Array.from({ length: Math.max(0, Math.trunc(detail.count || 0)) }).map(
        (_, index) => {
          const existing = previous.find(
            (instance) =>
              instance.transactionDetailId === detail._id &&
              instance.fixedAssetId === detail.fixedAssetId &&
              instance.tempId?.endsWith(`-${index}`),
          );
          const assetCode =
            fixedAssetsById.get(detail.fixedAssetId)?.code ||
            detail.fixedAssetId;
          const sequence = nextSequenceByAsset.get(detail.fixedAssetId) || 0;
          const code =
            existing?.code ||
            `${assetCode}_${String(sequence + 1).padStart(3, '0')}`;

          nextSequenceByAsset.set(
            detail.fixedAssetId,
            Math.max(sequence, getCodeSequence(code, assetCode)),
          );

          return {
            ...(existing || {}),
            tempId: existing?.tempId || `${detail._id}-${index}`,
            transactionDetailId: detail._id,
            fixedAssetId: detail.fixedAssetId,
            code,
            branchId: existing?.branchId || detail.branchId || trDoc.branchId,
            departmentId:
              existing?.departmentId ||
              detail.departmentId ||
              trDoc.departmentId,
            responsibleUserId: existing?.responsibleUserId || '',
            locationId: existing?.locationId || '',
            originalCost: existing?.originalCost ?? detail.unitPrice ?? 0,
          };
        },
      ),
    );

    form.setValue(`trDocs.${journalIndex}.extraData.fxaInstances`, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fixedAssetsData,
    form,
    instancesData,
    journalIndex,
    JSON.stringify(trDoc.details),
  ]);

  return null;
};

export const FxaIncomeDetailInstancesSheet = ({
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
  const { data } = useQuery<{ fixedAssets: TFixedAsset[] }>(
    FIXED_ASSETS_QUERY,
    {
      variables: {
        ids: detail?.fixedAssetId ? [detail.fixedAssetId] : [],
        limit: 1,
      },
      skip: !detail?.fixedAssetId,
    },
  );
  const fixedAsset = data?.fixedAssets?.[0];
  const instances = (trDoc.extraData?.fxaInstances || [])
    .map((instance, instanceIndex) => ({
      instance: instance as TFxaIncomeInstance,
      instanceIndex,
    }))
    .filter(({ instance }) => instance.transactionDetailId === detail?._id);

  const detailTitle = [fixedAsset?.code, fixedAsset?.name]
    .filter(Boolean)
    .join(' - ');

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <RecordTable.MoreButton
          type="button"
          disabled={!detail?.fixedAssetId}
          aria-label="Instance мэдээлэл"
          title="Instance мэдээлэл"
        />
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-4xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <div className="min-w-0">
            <Sheet.Title>
              {detailTitle || 'Үндсэн хөрөнгийн instance'}
            </Sheet.Title>
            <Sheet.Description>
              Тоо: {detail?.count || 0} | Нэгж үнэ: {detail?.unitPrice || 0}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Код</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
                <Table.Head>Өртөг</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {instances.map(({ instance, instanceIndex }) => {
                const fieldName = (name: string) =>
                  `trDocs.${journalIndex}.extraData.fxaInstances.${instanceIndex}.${name}` as never;

                return (
                  <Table.Row key={instance.tempId || instanceIndex}>
                    <Table.Cell>
                      <Form.Field
                        control={form.control}
                        name={fieldName('code')}
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
                        name={fieldName('responsibleUserId')}
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
                      <Form.Field
                        control={form.control}
                        name={fieldName('originalCost')}
                        render={({ field }) => (
                          <InputNumber
                            value={field.value ?? 0}
                            onChange={(value) => field.onChange(value || 0)}
                          />
                        )}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
