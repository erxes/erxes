import { useQuery } from '@apollo/client';
import { IconChecklist } from '@tabler/icons-react';
import { Button, Checkbox, Sheet, Table } from 'erxes-ui';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { FXA_INSTANCES_QUERY } from '../../graphql/queries/fixedAssets';
import { ITransactionGroupForm, TFxaDetail } from '../../types/JournalForms';

type IFxaInstance = {
  _id: string;
  fixedAssetId: string;
  code: string;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
};

export const FxaInstanceSelectionSheet = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });
  const details = (trDoc?.details || []) as TFxaDetail[];
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
  const { data } = useQuery<{ fxaInstances: IFxaInstance[] }>(
    FXA_INSTANCES_QUERY,
    {
      variables: { fixedAssetIds, status: 'active' },
      skip: !fixedAssetIds.length,
    },
  );
  const instances = data?.fxaInstances || [];

  useEffect(() => {
    if (!data) {
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
  }, [data, form, instances, journalIndex, selectedIds]);

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

  const toggleInstance = (instance: IFxaInstance, checked: boolean) => {
    if (checked) {
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
        <Button type="button" variant="secondary">
          <IconChecklist />
          Instance сонгох ({selectedIds.length}/{expectedCount})
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
          {selectedIds.length !== expectedCount && (
            <p className="mb-3 text-sm text-destructive">
              Detail тоо болон сонгосон instance-ийн тоо таарах ёстой.
            </p>
          )}
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-10" />
                <Table.Head>Instance код</Table.Head>
                <Table.Head>Хөрөнгө</Table.Head>
                <Table.Head>Салбар</Table.Head>
                <Table.Head>Хэлтэс</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {instances.map((instance) => {
                const selected = selectedIds.includes(instance._id);
                const selectedCount =
                  selectedByAsset[instance.fixedAssetId] || 0;
                const limit = expectedByAsset[instance.fixedAssetId] || 0;

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
                    <Table.Cell>{instance.code}</Table.Cell>
                    <Table.Cell>{instance.fixedAssetId}</Table.Cell>
                    <Table.Cell>{instance.branchId}</Table.Cell>
                    <Table.Cell>{instance.departmentId}</Table.Cell>
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
