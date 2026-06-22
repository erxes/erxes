import { IconSettings } from '@tabler/icons-react';
import { Button, Form, Input, InputNumber, Sheet, Table } from 'erxes-ui';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { ITransactionGroupForm, TFxaIncomeJournal } from '../../../types/JournalForms';

export const FxaIncomeInstancesSheet = ({
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
    const previous = trDoc.extraData?.fxaInstances || [];
    const next = (trDoc.details || []).flatMap((detail) =>
      Array.from({ length: Math.max(0, Math.trunc(detail.count || 0)) }).map(
        (_, index) => {
          const existing = previous.find(
            (instance) =>
              instance.transactionDetailId === detail._id &&
              instance.fixedAssetId === detail.fixedAssetId &&
              instance.tempId?.endsWith(`-${index}`),
          );

          return {
            ...(existing || {}),
            tempId: existing?.tempId || `${detail._id}-${index}`,
            transactionDetailId: detail._id,
            fixedAssetId: detail.fixedAssetId,
            code: existing?.code || '',
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
  }, [JSON.stringify(trDoc.details)]);

  const instances = trDoc.extraData?.fxaInstances || [];

  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button type="button" variant="secondary">
          <IconSettings />
          Instance мэдээлэл
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none md:max-w-4xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Үндсэн хөрөнгийн instance</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Үндсэн хөрөнгийн instance мэдээлэл
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Хөрөнгө</Table.Head>
                <Table.Head>Код</Table.Head>
                <Table.Head>Салбар</Table.Head>
                <Table.Head>Хэлтэс</Table.Head>
                <Table.Head>Эд хариуцагч</Table.Head>
                <Table.Head>Өртөг</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {instances.map((instance, instanceIndex) => {
                const fieldName = (name: string) =>
                  `trDocs.${journalIndex}.extraData.fxaInstances.${instanceIndex}.${name}` as any;

                return (
                  <Table.Row key={instance.tempId || instanceIndex}>
                    <Table.Cell>{instance.fixedAssetId}</Table.Cell>
                    <Table.Cell>
                      <Form.Field
                        control={form.control}
                        name={fieldName('code')}
                        render={({ field }) => (
                          <Input
                            value={field.value || ''}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Form.Field
                        control={form.control}
                        name={fieldName('branchId')}
                        render={({ field }) => (
                          <SelectBranches.FormItem
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Form.Field
                        control={form.control}
                        name={fieldName('departmentId')}
                        render={({ field }) => (
                          <SelectDepartments.FormItem
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Form.Field
                        control={form.control}
                        name={fieldName('responsibleUserId')}
                        render={({ field }) => (
                          <Input
                            value={field.value || ''}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
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
