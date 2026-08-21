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
  TFxaDetail,
  TFxaIncomeJournal,
} from '../../../types/JournalForms';
import {
  getFxaCodeSequence,
  getFxaInstanceDisplayCode,
} from '../../helpers/fxaHelpers';

type TFixedAsset = {
  _id: string;
  code?: string;
  name?: string;
  salvageValue?: number;
};

type TExistingInstance = {
  fixedAssetId: string;
  code: string;
  sequence?: number;
};

type TFxaIncomeInstance = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId: string;
  code?: string;
  sequence?: number;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  originalCost?: number;
};

type TFxaIncomeInstanceFollowInfo = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  salvageValue?: number;
  openingAccumulatedDepreciation?: number;
};

const getExistingIncomeInstance = (
  previous: TFxaIncomeInstance[],
  detail: TFxaDetail,
  index: number,
) =>
  previous.find(
    (instance) =>
      instance.transactionDetailId === detail._id &&
      instance.fixedAssetId === detail.fixedAssetId &&
      instance.tempId?.endsWith(`-${index}`),
  );

const buildIncomeInstance = ({
  detail,
  fixedAssetsById,
  index,
  nextSequenceByAsset,
  previous,
  trDoc,
}: {
  detail: TFxaDetail;
  fixedAssetsById: Map<string, TFixedAsset>;
  index: number;
  nextSequenceByAsset: Map<string, number>;
  previous: TFxaIncomeInstance[];
  trDoc: TFxaIncomeJournal;
}): TFxaIncomeInstance | undefined => {
  const existing = getExistingIncomeInstance(previous, detail, index);
  const assetCode = fixedAssetsById.get(detail.fixedAssetId)?.code;

  if (!assetCode) {
    return;
  }

  const sequence = nextSequenceByAsset.get(detail.fixedAssetId) || 0;
  const instanceSequence = existing?.sequence || sequence + 1;
  const code =
    existing?.code ||
    `${assetCode}_${String(instanceSequence).padStart(3, '0')}`;

  nextSequenceByAsset.set(
    detail.fixedAssetId,
    Math.max(sequence, instanceSequence, getFxaCodeSequence(code, assetCode)),
  );

  return {
    ...existing,
    tempId: existing?.tempId || `${detail._id}-${index}`,
    transactionDetailId: detail._id,
    fixedAssetId: detail.fixedAssetId,
    code,
    sequence: instanceSequence,
    branchId: existing?.branchId || detail.branchId || trDoc.branchId,
    departmentId:
      existing?.departmentId || detail.departmentId || trDoc.departmentId,
    responsibleUserId: existing?.responsibleUserId || '',
    originalCost: detail.unitPrice || existing?.originalCost || 0,
  };
};

const getExistingIncomeFollowInfo = (
  previous: TFxaIncomeInstanceFollowInfo[],
  instance: TFxaIncomeInstance,
) =>
  previous.find((followInfo) => {
    if (instance._id && followInfo._id === instance._id) {
      return true;
    }

    if (instance.tempId && followInfo.tempId === instance.tempId) {
      return true;
    }

    if (
      instance.fixedAssetId === followInfo.fixedAssetId &&
      instance.transactionDetailId === followInfo.transactionDetailId &&
      instance.sequence &&
      followInfo.sequence === instance.sequence
    ) {
      return true;
    }

    return (
      instance.fixedAssetId === followInfo.fixedAssetId &&
      instance.transactionDetailId === followInfo.transactionDetailId &&
      !!instance.code &&
      followInfo.code === instance.code
    );
  });

const buildIncomeFollowInfo = ({
  fixedAssetsById,
  instance,
  previous,
}: {
  fixedAssetsById: Map<string, TFixedAsset>;
  instance: TFxaIncomeInstance;
  previous: TFxaIncomeInstanceFollowInfo[];
}): TFxaIncomeInstanceFollowInfo => {
  const existing = getExistingIncomeFollowInfo(previous, instance);

  return {
    _id: instance._id,
    tempId: instance.tempId,
    transactionDetailId: instance.transactionDetailId,
    fixedAssetId: instance.fixedAssetId,
    code: instance.code,
    sequence: instance.sequence,
    salvageValue:
      existing?.salvageValue ??
      fixedAssetsById.get(instance.fixedAssetId)?.salvageValue,
    openingAccumulatedDepreciation:
      existing?.openingAccumulatedDepreciation || 0,
  };
};

const buildFxaIncomeInstances = ({
  details,
  fixedAssetsById,
  nextSequenceByAsset,
  previous,
  trDoc,
}: {
  details: TFxaDetail[];
  fixedAssetsById: Map<string, TFixedAsset>;
  nextSequenceByAsset: Map<string, number>;
  previous: TFxaIncomeInstance[];
  trDoc: TFxaIncomeJournal;
}) =>
  details.flatMap((detail) =>
    Array.from(
      { length: Math.max(0, Math.trunc(detail.count || 0)) },
      (_, index) =>
        buildIncomeInstance({
          detail,
          fixedAssetsById,
          index,
          nextSequenceByAsset,
          previous,
          trDoc,
        }),
    ).filter((instance): instance is TFxaIncomeInstance => !!instance),
  );

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
    if (fixedAssetIds.length && (!fixedAssetsData || !instancesData)) {
      return;
    }

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
          instance.sequence || 0,
          getFxaCodeSequence(instance.code || '', assetCode),
          getFxaCodeSequence(instance.code || '', instance.fixedAssetId),
        ),
      );
    }

    const next = buildFxaIncomeInstances({
      details: trDoc.details || [],
      fixedAssetsById,
      nextSequenceByAsset,
      previous,
      trDoc,
    });
    const nextFollowInfos = next.map((instance) =>
      buildIncomeFollowInfo({
        fixedAssetsById,
        instance,
        previous: trDoc.followInfos?.fxaIncomeInstances || [],
      }),
    );

    form.setValue(`trDocs.${journalIndex}.extraData.fxaInstances`, next);
    form.setValue(
      `trDocs.${journalIndex}.followInfos.fxaIncomeInstances`,
      nextFollowInfos,
    );
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
          className="w-10 p-0"
          disabled={!detail?.fixedAssetId}
          aria-label="Instance мэдээлэл"
          title="Instance мэдээлэл"
        />
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-6xl">
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
                <Table.Head>Үндсэн хөрөнгийн дугаар</Table.Head>
                <Table.Head>Код</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
                <Table.Head>Өртөг</Table.Head>
                <Table.Head>Үлдэх өртөг</Table.Head>
                <Table.Head>Өмнөх хур. элэгдэл</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {instances.map(({ instance, instanceIndex }) => {
                return (
                  <Table.Row key={instance.tempId || instanceIndex}>
                    <Table.Cell>
                      {getFxaInstanceDisplayCode(instance, fixedAsset?.code)}
                    </Table.Cell>
                    <Table.Cell>
                      <Form.Field
                        control={form.control}
                        name={`trDocs.${journalIndex}.extraData.fxaInstances.${instanceIndex}.code`}
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
                        name={`trDocs.${journalIndex}.extraData.fxaInstances.${instanceIndex}.responsibleUserId`}
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
                        name={`trDocs.${journalIndex}.extraData.fxaInstances.${instanceIndex}.originalCost`}
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
                        name={`trDocs.${journalIndex}.followInfos.fxaIncomeInstances.${instanceIndex}.salvageValue`}
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
                        name={`trDocs.${journalIndex}.followInfos.fxaIncomeInstances.${instanceIndex}.openingAccumulatedDepreciation`}
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
