import { useQuery } from '@apollo/client';
import { IconChecklist } from '@tabler/icons-react';
import { Button, Checkbox, Sheet, Table } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { useFixedAssets } from '@/settings/fixed-assets/hooks/useFixedAssets';
import { FXA_INSTANCES_QUERY } from '../../graphql/queries/fixedAssets';
import { ITransactionGroupForm, TFxaDetail } from '../../types/JournalForms';
import { MembersInline, SelectBranches, SelectDepartments } from 'ui-modules';

type IFxaInstance = {
  _id: string;
  fixedAssetId: string;
  code: string;
  sequence?: number;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
};

const getCodeSequence = (code: string, assetCode: string) => {
  const escapedAssetCode = assetCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^${escapedAssetCode}_(\\d+)$`).exec(code);

  return match ? Number(match[1]) : 0;
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
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });
  const details = (trDoc?.details || []) as TFxaDetail[];
  const detail = detailIndex !== undefined ? details[detailIndex] : undefined;
  const fixedAssetIds = Array.from(
    new Set(details.map((detail) => detail.fixedAssetId).filter(Boolean)),
  );
  const expectedByAsset = details.reduce<Record<string, number>>(
    (result, detail) => {
      if (detail.fixedAssetId) {
        result[detail.fixedAssetId] =
          (result[detail.fixedAssetId] || 0) + Math.max(0, detail.count || 0);
      }
      return result;
    },
    {},
  );
  const expectedCount = Object.values(expectedByAsset).reduce(
    (sum, count) => sum + count,
    0,
  );
  const selectedIds: string[] = trDoc?.extraData?.fxaInstanceIds || [];
  const selectedFixedAssetId = detail?.fixedAssetId;
  const { data: activeInstancesData } = useQuery<{
    fxaInstances: IFxaInstance[];
  }>(
    FXA_INSTANCES_QUERY,
    {
      variables: { fixedAssetIds, status: 'active' },
      skip: !fixedAssetIds.length,
    },
  );
  const { data: selectedInstancesData } = useQuery<{
    fxaInstances: IFxaInstance[];
  }>(
    FXA_INSTANCES_QUERY,
    {
      variables: { ids: selectedIds },
      skip: !selectedIds.length,
    },
  );
  const instances = useMemo(() => {
    const instancesById = new Map<string, IFxaInstance>();

    for (const instance of activeInstancesData?.fxaInstances || []) {
      instancesById.set(instance._id, instance);
    }

    for (const instance of selectedInstancesData?.fxaInstances || []) {
      instancesById.set(instance._id, instance);
    }

    return Array.from(instancesById.values());
  }, [activeInstancesData, selectedInstancesData]);
  const { fixedAssets } = useFixedAssets({
    variables: { ids: fixedAssetIds, limit: fixedAssetIds.length },
    skip: !fixedAssetIds.length,
  });
  const fixedAssetsById = new Map(
    (fixedAssets || []).map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );

  useEffect(() => {
    if (!activeInstancesData || (selectedIds.length && !selectedInstancesData)) {
      return;
    }

    const availableIds = new Set(instances.map((instance) => instance._id));
    const nextSelectedIds = selectedIds.filter((id) => availableIds.has(id));

    if (nextSelectedIds.length !== selectedIds.length) {
      form.setValue(
        `trDocs.${journalIndex}.extraData.fxaInstanceIds`,
        nextSelectedIds,
      );
    }
  }, [
    activeInstancesData,
    form,
    instances,
    journalIndex,
    selectedIds,
    selectedInstancesData,
  ]);

  const visibleInstances = selectedFixedAssetId
    ? instances.filter(
        (instance) => instance.fixedAssetId === selectedFixedAssetId,
      )
    : instances;
  const selectedByAsset = instances.reduce<Record<string, number>>(
    (result, instance) => {
      if (selectedIds.includes(instance._id)) {
        result[instance.fixedAssetId] =
          (result[instance.fixedAssetId] || 0) + 1;
      }
      return result;
    },
    {},
  );
  const selectedCount = selectedFixedAssetId
    ? selectedByAsset[selectedFixedAssetId] || 0
    : selectedIds.length;
  const visibleExpectedCount = selectedFixedAssetId
    ? expectedByAsset[selectedFixedAssetId] || 0
    : expectedCount;
  const getDisplaySequence = (instance: IFxaInstance) => {
    const fixedAssetCode = fixedAssetsById.get(instance.fixedAssetId)?.code;

    return (
      instance.sequence ||
      (fixedAssetCode ? getCodeSequence(instance.code, fixedAssetCode) : 0) ||
      getCodeSequence(instance.code, instance.fixedAssetId)
    );
  };
  const getFixedAssetSequenceLabel = (instance: IFxaInstance) => {
    if (instance.code) {
      return instance.code;
    }

    const fixedAssetCode = fixedAssetsById.get(instance.fixedAssetId)?.code;
    const sequence = getDisplaySequence(instance);

    if (!fixedAssetCode || !sequence) {
      return '-';
    }

    return `${fixedAssetCode}_${String(sequence).padStart(3, '0')}`;
  };

  const toggleInstance = (instance: IFxaInstance, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(instance._id)) {
        return;
      }

      form.setValue(`trDocs.${journalIndex}.extraData.fxaInstanceIds`, [
        ...selectedIds,
        instance._id,
      ]);
      return;
    }

    form.setValue(
      `trDocs.${journalIndex}.extraData.fxaInstanceIds`,
      selectedIds.filter((id) => id !== instance._id),
    );
  };

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          className={compact ? 'h-8 px-2' : undefined}
          disabled={compact && !selectedFixedAssetId}
        >
          <IconChecklist />
          {compact
            ? `${selectedCount}/${visibleExpectedCount}`
            : `Instance сонгох (${selectedCount}/${visibleExpectedCount})`}
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
          {selectedCount !== visibleExpectedCount && (
            <p className="mb-3 text-sm text-destructive">
              Detail тоо болон сонгосон instance-ийн тоо таарах ёстой.
            </p>
          )}
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-10" />
                <Table.Head>Үндсэн хөрөнгийн дугаар</Table.Head>
                <Table.Head>Instance код</Table.Head>
                <Table.Head>Хөрөнгө</Table.Head>
                <Table.Head>Салбар</Table.Head>
                <Table.Head>Хэлтэс</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleInstances.map((instance) => {
                const selected = selectedIds.includes(instance._id);
                const selectedCount =
                  selectedByAsset[instance.fixedAssetId] || 0;
                const limit = expectedByAsset[instance.fixedAssetId] || 0;
                const fixedAsset = fixedAssetsById.get(instance.fixedAssetId);

                return (
                  <Table.Row key={instance._id}>
                    <Table.Cell>
                      <Checkbox
                        checked={selected}
                        disabled={!selected && selectedCount >= limit}
                        onCheckedChange={(checked) =>
                          toggleInstance(instance, Boolean(checked))
                        }
                      />
                    </Table.Cell>
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
                      {instance.branchId ? (
                        <SelectBranches.InlineCell
                          mode="single"
                          value={instance.branchId}
                        />
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {instance.departmentId ? (
                        <SelectDepartments.InlineCell
                          mode="single"
                          value={instance.departmentId}
                        />
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {instance.responsibleUserId ? (
                        <MembersInline
                          memberIds={[instance.responsibleUserId]}
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
