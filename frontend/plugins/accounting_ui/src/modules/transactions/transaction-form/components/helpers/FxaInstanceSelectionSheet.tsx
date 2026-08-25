import { useQuery } from '@apollo/client';
import { IconChecklist } from '@tabler/icons-react';
import {
  Button,
  CurrencyCode,
  CurrencyFormatedDisplay,
  Sheet,
  Table,
} from 'erxes-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { useFixedAssets } from '@/settings/fixed-assets/hooks/useFixedAssets';
import { FXA_INSTANCES_QUERY } from '../../graphql/queries/fixedAssets';
import { ITransactionGroupForm, TFxaDetail } from '../../types/JournalForms';
import { MembersInline, SelectBranches, SelectDepartments } from 'ui-modules';
import { getFxaCodeSequence, getFxaInstanceDisplayCode } from './fxaHelpers';
import { TrJournalEnum } from '@/transactions/types/constants';

type IFxaInstance = {
  _id: string;
  fixedAssetId: string;
  code: string;
  sequence?: number;
  count?: number;
  currentCount?: number;
  originalCost?: number;
  accumulatedDepreciation?: number;
  bookValue?: number;
  branchId?: string;
  currentBranchId?: string;
  departmentId?: string;
  currentDepartmentId?: string;
  responsibleUserId?: string;
  currentResponsibleUserId?: string;
};

type TFxaInstanceSelection = {
  fxaInstanceId: string;
  count: number;
};

const AmountCell = ({ amount }: { amount?: number }) => (
  <CurrencyFormatedDisplay
    currencyValue={{
      currencyCode: CurrencyCode.MNT,
      amountMicros: amount || 0,
    }}
  />
);

const getUniqueIds = (ids: string[]) => Array.from(new Set(ids));

const getFlatSelectedIds = (idsByDetailId: Record<string, string[]>) =>
  getUniqueIds(Object.values(idsByDetailId).flat());

const getSelectionCountById = (selections: TFxaInstanceSelection[]) =>
  selections.reduce<Record<string, number>>((result, selection) => {
    result[selection.fxaInstanceId] =
      (result[selection.fxaInstanceId] || 0) +
      Math.max(0, selection.count || 0);

    return result;
  }, {});

const normalizeSelections = (selections?: TFxaInstanceSelection[]) =>
  (selections || [])
    .map((selection) => ({
      fxaInstanceId: selection.fxaInstanceId,
      count: Math.max(0, Math.trunc(selection.count || 0)),
    }))
    .filter((selection) => selection.fxaInstanceId && selection.count > 0);

const idsToSelections = (ids: string[]) =>
  getUniqueIds(ids).map((fxaInstanceId) => ({ fxaInstanceId, count: 1 }));

const getFlatSelections = (
  selectionsByDetailId: Record<string, TFxaInstanceSelection[]>,
) => Object.values(selectionsByDetailId).flatMap(normalizeSelections);

export const clearFxaInstanceSelectionForDetail = ({
  detailId,
  form,
  journalIndex,
  selectedIdsByDetailId,
  selectedSelectionsByDetailId,
}: {
  detailId?: string;
  form: ITransactionGroupForm;
  journalIndex: number;
  selectedIdsByDetailId?: Record<string, string[]>;
  selectedSelectionsByDetailId?: Record<string, TFxaInstanceSelection[]>;
}) => {
  if (!detailId) {
    return;
  }

  const nextSelectionsByDetailId = {
    ...(selectedSelectionsByDetailId || {}),
  };
  const nextIdsByDetailId = { ...(selectedIdsByDetailId || {}) };

  delete nextSelectionsByDetailId[detailId];
  delete nextIdsByDetailId[detailId];

  form.setValue(
    `trDocs.${journalIndex}.extraData.fxaInstanceSelectionsByDetailId`,
    nextSelectionsByDetailId,
  );
  form.setValue(
    `trDocs.${journalIndex}.extraData.fxaInstanceSelections`,
    getFlatSelections(nextSelectionsByDetailId),
  );
  form.setValue(
    `trDocs.${journalIndex}.extraData.fxaInstanceIdsByDetailId`,
    nextIdsByDetailId,
  );
  form.setValue(
    `trDocs.${journalIndex}.extraData.fxaInstanceIds`,
    getFlatSelectedIds(nextIdsByDetailId),
  );
};

export const FxaInstanceSelectionSheet = ({
  form,
  journalIndex,
  detailIndex,
  compact,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  detailIndex?: number;
  compact?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ignoreNextCloseRef = useRef(false);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });
  const details = (trDoc?.details || []) as TFxaDetail[];
  const detail = detailIndex !== undefined ? details[detailIndex] : undefined;
  const selectedIdsByDetailId: Record<string, string[]> =
    trDoc?.extraData?.fxaInstanceIdsByDetailId || {};
  const selectedSelectionsByDetailId: Record<string, TFxaInstanceSelection[]> =
    trDoc?.extraData?.fxaInstanceSelectionsByDetailId || {};
  const flatSelections = normalizeSelections(
    trDoc?.extraData?.fxaInstanceSelections,
  );
  const hasDetailSelectionMap =
    Object.keys(selectedSelectionsByDetailId).length > 0 ||
    Object.keys(selectedIdsByDetailId).length > 0;
  const detailId = detail?._id || '';
  const flatSelectedIds: string[] = getUniqueIds(
    trDoc?.extraData?.fxaInstanceIds || [],
  );
  const selectedSelections: TFxaInstanceSelection[] = detailId
    ? hasDetailSelectionMap
      ? normalizeSelections(selectedSelectionsByDetailId[detailId]).length
        ? normalizeSelections(selectedSelectionsByDetailId[detailId])
        : idsToSelections(selectedIdsByDetailId[detailId] || [])
      : flatSelections.length
      ? flatSelections
      : idsToSelections(flatSelectedIds)
    : flatSelections.length
    ? flatSelections
    : idsToSelections(flatSelectedIds);
  const selectedIds = selectedSelections.map(
    (selection) => selection.fxaInstanceId,
  );
  const otherDetailSelectionCounts = getSelectionCountById(
    hasDetailSelectionMap
      ? [
          ...Object.entries(selectedSelectionsByDetailId)
            .filter(([key]) => key !== detailId)
            .flatMap(([, selections]) => normalizeSelections(selections)),
          ...Object.entries(selectedIdsByDetailId)
            .filter(([key]) => key !== detailId)
            .flatMap(([, ids]) => idsToSelections(ids)),
        ]
      : [],
  );
  const allSelectionIds = getUniqueIds(
    [
      ...flatSelections,
      ...getFlatSelections(selectedSelectionsByDetailId),
      ...idsToSelections(flatSelectedIds),
    ].map((selection) => selection.fxaInstanceId),
  );
  const querySelectedIds = detailId
    ? getUniqueIds([...selectedIds, ...flatSelectedIds, ...allSelectionIds])
    : getUniqueIds([...flatSelectedIds, ...allSelectionIds]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedFixedAssetId = detail?.fixedAssetId;
  const { data: activeInstancesData } = useQuery<{
    fxaInstances: IFxaInstance[];
  }>(FXA_INSTANCES_QUERY, {
    variables: {
      fixedAssetIds: selectedFixedAssetId ? [selectedFixedAssetId] : undefined,
      status: 'active',
    },
    fetchPolicy: 'network-only',
  });
  const { data: selectedInstancesData } = useQuery<{
    fxaInstances: IFxaInstance[];
  }>(FXA_INSTANCES_QUERY, {
    variables: { ids: querySelectedIds },
    skip: !querySelectedIds.length,
    fetchPolicy: 'network-only',
  });
  const { data: transactionInstancesData } = useQuery<{
    fxaInstances: IFxaInstance[];
  }>(FXA_INSTANCES_QUERY, {
    variables: {
      fixedAssetIds: selectedFixedAssetId ? [selectedFixedAssetId] : undefined,
      transactionId: trDoc?._id,
      disposalTransactionId: trDoc?._id,
    },
    skip: !trDoc?._id,
    fetchPolicy: 'network-only',
  });
  const instances = useMemo(() => {
    const instancesById = new Map<string, IFxaInstance>();

    for (const instance of activeInstancesData?.fxaInstances || []) {
      instancesById.set(instance._id, instance);
    }

    for (const instance of selectedInstancesData?.fxaInstances || []) {
      instancesById.set(instance._id, instance);
    }

    for (const instance of transactionInstancesData?.fxaInstances || []) {
      instancesById.set(instance._id, instance);
    }

    return Array.from(instancesById.values());
  }, [activeInstancesData, selectedInstancesData, transactionInstancesData]);
  const visibleAssetIds = Array.from(
    new Set(instances.map((instance) => instance.fixedAssetId).filter(Boolean)),
  );
  const { fixedAssets } = useFixedAssets({
    variables: { ids: visibleAssetIds, limit: visibleAssetIds.length },
    skip: !visibleAssetIds.length,
  });
  const fixedAssetsById = new Map(
    (fixedAssets || []).map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );

  useEffect(() => {
    if (
      !activeInstancesData ||
      (querySelectedIds.length && !selectedInstancesData)
    ) {
      return;
    }

    const availableIds = new Set(instances.map((instance) => instance._id));
    const nextSelectedSelections = selectedSelections.filter((selection) =>
      availableIds.has(selection.fxaInstanceId),
    );

    if (nextSelectedSelections.length !== selectedSelections.length) {
      updateSelectedSelections(nextSelectedSelections);
    }
  }, [
    activeInstancesData,
    form,
    instances,
    journalIndex,
    querySelectedIds,
    selectedSelections,
    selectedInstancesData,
  ]);

  const visibleInstances = (
    selectedFixedAssetId
      ? instances.filter(
          (instance) => instance.fixedAssetId === selectedFixedAssetId,
        )
      : instances
  ).filter(
    (instance) =>
      selectedIdSet.has(instance._id) ||
      (instance.currentCount ?? instance.count ?? 1) >
        (otherDetailSelectionCounts[instance._id] || 0),
  );
  const selectedSelection = selectedSelections[0];
  const selectedCount = selectedSelection?.count || 0;
  const detailCount = Math.max(0, Math.trunc(detail?.count || 0));
  const getDisplaySequence = (instance: IFxaInstance) => {
    const fixedAssetCode = fixedAssetsById.get(instance.fixedAssetId)?.code;

    return (
      instance.sequence ||
      (fixedAssetCode
        ? getFxaCodeSequence(instance.code, fixedAssetCode)
        : 0) ||
      getFxaCodeSequence(instance.code, instance.fixedAssetId)
    );
  };
  const getFixedAssetSequenceLabel = (instance: IFxaInstance) => {
    const fixedAssetCode = fixedAssetsById.get(instance.fixedAssetId)?.code;
    return getFxaInstanceDisplayCode(
      {
        code: instance.code,
        sequence: getDisplaySequence(instance),
      },
      fixedAssetCode,
    );
  };

  const updateSelectedSelections = (
    nextSelectedSelections: TFxaInstanceSelection[],
  ) => {
    const normalizedSelections = normalizeSelections(nextSelectedSelections);
    ignoreNextCloseRef.current = true;

    window.setTimeout(() => {
      ignoreNextCloseRef.current = false;
    }, 0);

    if (!detailId) {
      const flatIds = getUniqueIds(
        normalizedSelections.map((selection) => selection.fxaInstanceId),
      );

      form.setValue(
        `trDocs.${journalIndex}.extraData.fxaInstanceSelections`,
        normalizedSelections,
      );
      form.setValue(`trDocs.${journalIndex}.extraData.fxaInstanceIds`, flatIds);
      return;
    }

    const nextSelectedSelectionsByDetailId = {
      ...selectedSelectionsByDetailId,
      [detailId]: normalizedSelections,
    };
    const flatSelections = getFlatSelections(nextSelectedSelectionsByDetailId);
    const nextSelectedIdsByDetailId = Object.fromEntries(
      Object.entries(nextSelectedSelectionsByDetailId).map(([key, value]) => [
        key,
        normalizeSelections(value).map((selection) => selection.fxaInstanceId),
      ]),
    );
    const flatIds = getFlatSelectedIds(nextSelectedIdsByDetailId);

    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaInstanceSelectionsByDetailId`,
      nextSelectedSelectionsByDetailId,
    );
    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaInstanceSelections`,
      flatSelections,
    );
    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaInstanceIdsByDetailId`,
      nextSelectedIdsByDetailId,
    );
    form.setValue(`trDocs.${journalIndex}.extraData.fxaInstanceIds`, flatIds);
  };

  useEffect(() => {
    if (
      !detailId ||
      selectedSelections.length !== 1 ||
      detailCount <= 0 ||
      selectedSelections[0].count === detailCount
    ) {
      return;
    }

    updateSelectedSelections([
      {
        ...selectedSelections[0],
        count: detailCount,
      },
    ]);
  }, [detailCount, detailId, JSON.stringify(selectedSelections)]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && ignoreNextCloseRef.current) {
      return;
    }

    setOpen(nextOpen);
  };

  const getAvailableCount = (instance: IFxaInstance) =>
    Math.max(
      0,
      (instance.currentCount ?? instance.count ?? 1) -
        (otherDetailSelectionCounts[instance._id] || 0),
    );

  const updateDetailFromInstance = (instance: IFxaInstance, count: number) => {
    if (detailIndex === undefined) {
      return;
    }

    const unitPrice = instance.originalCost || 0;
    const branchId = instance.currentBranchId || instance.branchId || '';
    const departmentId =
      instance.currentDepartmentId || instance.departmentId || '';

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.fixedAssetId`,
      instance.fixedAssetId,
    );
    form.setValue(`trDocs.${journalIndex}.details.${detailIndex}.count`, count);
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.branchId`,
      branchId,
    );
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.departmentId`,
      departmentId,
    );

    if (trDoc?.journal === TrJournalEnum.FXA_SALE) {
      form.setValue(
        `trDocs.${journalIndex}.details.${detailIndex}.amount`,
        count * (detail?.unitPrice || 0),
      );
      return;
    }

    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.unitPrice`,
      unitPrice,
    );
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.amount`,
      count * unitPrice,
    );
  };

  const selectInstance = (instance: IFxaInstance) => {
    const otherCount = otherDetailSelectionCounts[instance._id] || 0;
    const availableCount = Math.max(
      0,
      (instance.currentCount ?? instance.count ?? 1) - otherCount,
    );
    const nextCount = Math.min(
      availableCount,
      Math.max(1, Math.trunc(detail?.count || 0)),
    );

    if (nextCount <= 0) {
      return;
    }

    updateDetailFromInstance(instance, nextCount);
    updateSelectedSelections([
      { fxaInstanceId: instance._id, count: nextCount },
    ]);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          className={compact ? 'h-8 px-2' : undefined}
        >
          <IconChecklist />
          {compact
            ? selectedCount
              ? `Instance (${selectedCount})`
              : 'Instance'
            : selectedCount
            ? `Instance сонгосон (${selectedCount})`
            : 'Instance сонгох'}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-4xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Үндсэн хөрөнгийн instance сонгох</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Зарцуулах, шилжүүлэх эсвэл борлуулах instance сонгох
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-24">Сонголт</Table.Head>
                <Table.Head>Үлдэгдэл</Table.Head>
                <Table.Head>Үндсэн хөрөнгийн дугаар</Table.Head>
                <Table.Head>Instance код</Table.Head>
                <Table.Head>Хөрөнгө</Table.Head>
                <Table.Head>Анхны өртөг</Table.Head>
                <Table.Head>Хур.элэгдэл</Table.Head>
                <Table.Head>Үлдэгдэл өртөг</Table.Head>
                <Table.Head>Салбар</Table.Head>
                <Table.Head>Хэлтэс</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleInstances.map((instance) => {
                const selected = selectedIdSet.has(instance._id);
                const availableCount = getAvailableCount(instance);
                const fixedAsset = fixedAssetsById.get(instance.fixedAssetId);

                return (
                  <Table.Row key={instance._id}>
                    <Table.Cell>
                      <Button
                        type="button"
                        size="sm"
                        variant={selected ? 'secondary' : 'ghost'}
                        disabled={!selected && availableCount <= 0}
                        onClick={() => selectInstance(instance)}
                      >
                        {selected ? 'Сонгосон' : 'Сонгох'}
                      </Button>
                    </Table.Cell>
                    <Table.Cell>{availableCount}</Table.Cell>
                    <Table.Cell>
                      {getFixedAssetSequenceLabel(instance)}
                    </Table.Cell>
                    <Table.Cell>{instance.code}</Table.Cell>
                    <Table.Cell>
                      <SelectFixedAsset.Provider
                        mode="single"
                        value={instance.fixedAssetId}
                        fixedAssets={fixedAsset ? [fixedAsset] : []}
                        placeholder="-"
                      >
                        <SelectFixedAsset.Value placeholder="-" />
                      </SelectFixedAsset.Provider>
                    </Table.Cell>
                    <Table.Cell>
                      <AmountCell amount={instance.originalCost} />
                    </Table.Cell>
                    <Table.Cell>
                      <AmountCell amount={instance.accumulatedDepreciation} />
                    </Table.Cell>
                    <Table.Cell>
                      <AmountCell amount={instance.bookValue} />
                    </Table.Cell>
                    <Table.Cell>
                      {instance.currentBranchId || instance.branchId ? (
                        <SelectBranches.InlineCell
                          mode="single"
                          value={instance.currentBranchId || instance.branchId}
                        />
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {instance.currentDepartmentId || instance.departmentId ? (
                        <SelectDepartments.InlineCell
                          mode="single"
                          value={
                            instance.currentDepartmentId ||
                            instance.departmentId
                          }
                        />
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {instance.currentResponsibleUserId ||
                      instance.responsibleUserId ? (
                        <MembersInline
                          memberIds={[
                            instance.currentResponsibleUserId ||
                              instance.responsibleUserId ||
                              '',
                          ]}
                          placeholder="-"
                        />
                      ) : (
                        '-'
                      )}
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
