import { useQuery } from '@apollo/client';
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
import { getTempId } from '../../utils';

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
  primaryInstanceId?: string;
  code?: string;
  sequence?: number;
  count?: number;
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
  primaryInstanceId?: string;
  code?: string;
  sequence?: number;
  salvageValue?: number;
  openingAccumulatedDepreciation?: number;
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
    primaryInstanceId: instance.primaryInstanceId,
    code: instance.code,
    sequence: instance.sequence,
    salvageValue:
      existing?.salvageValue ??
      fixedAssetsById.get(instance.fixedAssetId)?.salvageValue,
    openingAccumulatedDepreciation:
      existing?.openingAccumulatedDepreciation || 0,
  };
};

const normalizeFxaIncomeInstances = ({
  details,
  fixedAssetsById,
  previous,
  trDoc,
}: {
  details: TFxaDetail[];
  fixedAssetsById: Map<string, TFixedAsset>;
  previous: TFxaIncomeInstance[];
  trDoc: TFxaIncomeJournal;
}) =>
  previous.reduce<TFxaIncomeInstance[]>((result, instance) => {
    const detail = details.find(
      (item) =>
        item._id === instance.transactionDetailId &&
        item.fixedAssetId === instance.fixedAssetId,
    );

    if (!detail || !fixedAssetsById.has(detail.fixedAssetId)) {
      return result;
    }

    result.push({
      ...instance,
      transactionDetailId: detail._id,
      fixedAssetId: detail.fixedAssetId,
      branchId: instance.branchId || detail.branchId || trDoc.branchId,
      departmentId:
        instance.departmentId || detail.departmentId || trDoc.departmentId,
      originalCost: instance.originalCost ?? detail.unitPrice ?? 0,
    });

    return result;
  }, []);

const getDetailInstanceCount = (instances: TFxaIncomeInstance[]) =>
  instances.reduce(
    (sum, instance) => sum + Math.max(0, Math.trunc(instance.count || 0)),
    0,
  );

const getNextSequence = ({
  assetCode,
  existingInstances,
  fixedAssetId,
  managedInstances,
}: {
  assetCode?: string;
  existingInstances: TExistingInstance[];
  fixedAssetId: string;
  managedInstances: TFxaIncomeInstance[];
}) => {
  if (!assetCode) {
    return 1;
  }

  return (
    Math.max(
      0,
      ...existingInstances
        .filter((instance) => instance.fixedAssetId === fixedAssetId)
        .map((instance) =>
          Math.max(
            instance.sequence || 0,
            getFxaCodeSequence(instance.code || '', assetCode),
            getFxaCodeSequence(instance.code || '', fixedAssetId),
          ),
        ),
      ...managedInstances
        .filter((instance) => instance.fixedAssetId === fixedAssetId)
        .map((instance) =>
          Math.max(
            instance.sequence || 0,
            getFxaCodeSequence(instance.code || '', assetCode),
            getFxaCodeSequence(instance.code || '', fixedAssetId),
          ),
        ),
    ) + 1
  );
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
  useEffect(() => {
    if (fixedAssetIds.length && !fixedAssetsData) {
      return;
    }

    const previous = trDoc.extraData?.fxaInstances || [];
    const fixedAssetsById = new Map(
      (fixedAssetsData?.fixedAssets || []).map((asset) => [asset._id, asset]),
    );
    const next = normalizeFxaIncomeInstances({
      details: trDoc.details || [],
      fixedAssetsById,
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

    if (JSON.stringify(previous) !== JSON.stringify(next)) {
      form.setValue(`trDocs.${journalIndex}.extraData.fxaInstances`, next);
    }

    if (
      JSON.stringify(trDoc.followInfos?.fxaIncomeInstances || []) !==
      JSON.stringify(nextFollowInfos)
    ) {
      form.setValue(
        `trDocs.${journalIndex}.followInfos.fxaIncomeInstances`,
        nextFollowInfos,
      );
    }
  }, [fixedAssetsData, form, journalIndex, JSON.stringify(trDoc.details)]);

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
  const { data: instancesData } = useQuery<{
    fxaInstances: TExistingInstance[];
  }>(FXA_INSTANCES_QUERY, {
    variables: {
      fixedAssetIds: detail?.fixedAssetId ? [detail.fixedAssetId] : [],
    },
    skip: !detail?.fixedAssetId,
  });
  const fixedAsset = data?.fixedAssets?.[0];
  const managedInstances = (trDoc.extraData?.fxaInstances ||
    []) as TFxaIncomeInstance[];
  const followInfos = trDoc.followInfos?.fxaIncomeInstances || [];
  const instances = managedInstances
    .map((instance, instanceIndex) => ({
      instance: instance as TFxaIncomeInstance,
      instanceIndex,
    }))
    .filter(({ instance }) => instance.transactionDetailId === detail?._id);

  const detailTitle = [fixedAsset?.code, fixedAsset?.name]
    .filter(Boolean)
    .join(' - ');
  const managedCount = getDetailInstanceCount(
    instances.map(({ instance }) => instance),
  );
  const detailCount = Math.max(0, Math.trunc(detail?.count || 0));
  const remainingCount = Math.max(0, detailCount - managedCount);
  const hasManagedRows = instances.length > 0;
  const addButtonTip = !detail?.fixedAssetId
    ? 'Эхлээд үндсэн хөрөнгө сонгоно уу.'
    : remainingCount > 0
    ? `Нэмэгдээгүй ${remainingCount} ширхэг байна. Хэрэв мөр нэмэхгүй хадгалбал backend нэг default bucket instance үүсгэнэ.`
    : hasManagedRows
    ? 'Instance мөрүүдийн тоо detail-ийн тоотой таарсан.'
    : 'Мөр нэмээгүй хадгалбал backend detail-ийн тоогоор нэг default bucket instance үүсгэнэ.';
  const fixedAssetsById = new Map(
    (data?.fixedAssets || []).map((asset) => [asset._id, asset]),
  );

  const syncIncomeRows = (
    nextInstances: TFxaIncomeInstance[],
    nextFollowInfos: TFxaIncomeInstanceFollowInfo[],
  ) => {
    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaInstances`,
      nextInstances,
    );
    form.setValue(
      `trDocs.${journalIndex}.followInfos.fxaIncomeInstances`,
      nextFollowInfos,
    );
  };

  const addInstance = () => {
    if (!detail?.fixedAssetId || !fixedAsset || remainingCount <= 0) {
      return;
    }

    const sequence = getNextSequence({
      assetCode: fixedAsset.code,
      existingInstances: instancesData?.fxaInstances || [],
      fixedAssetId: detail.fixedAssetId,
      managedInstances,
    });
    const instance: TFxaIncomeInstance = {
      tempId: `${detail._id}-${getTempId()}`,
      transactionDetailId: detail._id,
      fixedAssetId: detail.fixedAssetId,
      code: fixedAsset.code
        ? `${fixedAsset.code}_${String(sequence).padStart(3, '0')}`
        : undefined,
      sequence,
      count: remainingCount,
      branchId: detail.branchId || trDoc.branchId,
      departmentId: detail.departmentId || trDoc.departmentId,
      responsibleUserId: '',
      originalCost: detail.unitPrice || 0,
    };

    syncIncomeRows(
      [...managedInstances, instance],
      [
        ...followInfos,
        buildIncomeFollowInfo({
          fixedAssetsById,
          instance,
          previous: followInfos,
        }),
      ],
    );
  };

  const removeInstance = (instanceIndex: number) => {
    syncIncomeRows(
      managedInstances.filter((_, index) => index !== instanceIndex),
      followInfos.filter((_, index) => index !== instanceIndex),
    );
  };

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
              Тоо: {detailCount} | Managed: {managedCount} | Үлдсэн:{' '}
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
                  disabled={!detail?.fixedAssetId || remainingCount <= 0}
                  onClick={addInstance}
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
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Үндсэн хөрөнгийн дугаар</Table.Head>
                <Table.Head>Код</Table.Head>
                <Table.Head>Тоо</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
                <Table.Head>Өртөг</Table.Head>
                <Table.Head>Үлдэх өртөг</Table.Head>
                <Table.Head>Өмнөх хур. элэгдэл</Table.Head>
                <Table.Head className="w-10" />
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
                        name={`trDocs.${journalIndex}.extraData.fxaInstances.${instanceIndex}.count`}
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
                    <Table.Cell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstance(instanceIndex)}
                      >
                        <IconTrash />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              {!instances.length && (
                <Table.Row>
                  <Table.Cell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Instance мөр алга.
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
