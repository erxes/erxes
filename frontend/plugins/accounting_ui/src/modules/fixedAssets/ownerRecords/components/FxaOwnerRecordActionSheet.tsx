import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Sheet,
  Spinner,
  toast,
} from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { z } from 'zod';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import {
  useFixedAssetOwnerRecordAdd,
  useFixedAssetOwnerRecordTransfer,
} from '@/settings/fixed-assets/hooks/useFixedAssetMutations';

const ownerRecordActionSchema = z
  .object({
    fixedAssetId: z.string().min(1, 'Үндсэн хөрөнгө сонгоно уу'),
    code: z.string().optional(),
    sequence: z.number().optional(),
    count: z.number().gt(0, 'Тоо 0-ээс их байх ёстой'),
    ownerId: z.string().optional(),
    fromOwnerId: z.string().optional(),
    toOwnerId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.ownerId && !value.fromOwnerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Эд хариуцагч сонгоно уу',
        path: ['ownerId'],
      });
    }

    if (value.fromOwnerId !== undefined && !value.toOwnerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Хүлээн авах эд хариуцагч сонгоно уу',
        path: ['toOwnerId'],
      });
    }

    if (
      value.fromOwnerId &&
      value.toOwnerId &&
      value.fromOwnerId === value.toOwnerId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Шилжүүлэх эд хариуцагчид ялгаатай байх ёстой',
        path: ['toOwnerId'],
      });
    }
  });

type TOwnerRecordActionForm = z.infer<typeof ownerRecordActionSchema>;

type TActionMode = 'receive' | 'transfer' | 'handOver';

const ACTION_LABELS: Record<TActionMode, string> = {
  receive: 'Эд хариуцагчид оноох',
  transfer: 'Эд хариуцагч шилжүүлэх',
  handOver: 'Эд хариуцагчаас цуцлах',
};

export const FxaOwnerRecordActionSheet = ({
  children,
  defaultValues,
  mode,
}: {
  children: ReactNode;
  defaultValues?: Partial<TOwnerRecordActionForm>;
  mode: TActionMode;
}) => {
  const [open, setOpen] = useState(false);
  const { addFixedAssetOwnerRecord, loading: addLoading } =
    useFixedAssetOwnerRecordAdd();
  const { transferFixedAssetOwnerRecord, loading: transferLoading } =
    useFixedAssetOwnerRecordTransfer();
  const loading = addLoading || transferLoading;
  const form = useForm<TOwnerRecordActionForm>({
    resolver: zodResolver(ownerRecordActionSchema),
    defaultValues: {
      fixedAssetId: '',
      code: '',
      count: 1,
      ownerId: '',
      fromOwnerId: '',
      toOwnerId: '',
      ...defaultValues,
    },
  });

  const handleInvalid = () => {
    toast({
      title: 'Мэдээлэл дутуу байна',
      description: 'Үндсэн хөрөнгө, тоо болон эд хариуцагчийг шалгана уу.',
      variant: 'destructive',
    });
  };

  const handleSubmit = (values: TOwnerRecordActionForm) => {
    if (mode === 'transfer') {
      transferFixedAssetOwnerRecord({
        variables: {
          fixedAssetId: values.fixedAssetId,
          code: values.code || undefined,
          sequence: values.sequence,
          count: values.count,
          fromOwnerId: values.fromOwnerId,
          toOwnerId: values.toOwnerId,
        },
        onCompleted: () => setOpen(false),
      });
      return;
    }

    addFixedAssetOwnerRecord({
      variables: {
        fixedAssetId: values.fixedAssetId,
        code: values.code || undefined,
        sequence: values.sequence,
        count: values.count,
        action: mode === 'receive' ? 'received' : 'handedOver',
        status: 'active',
        ownerId: values.ownerId,
      },
      onCompleted: () => setOpen(false),
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="p-0 flex flex-col overflow-hidden flex-none md:max-w-2xl">
        <Sheet.Header className="p-4 border-b">
          <Sheet.Title>{ACTION_LABELS[mode]}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            className="flex flex-col flex-1 min-h-0"
            onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
          >
            <Sheet.Content className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-auto">
              <Form.Field
                control={form.control}
                name="fixedAssetId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Үндсэн хөрөнгө</Form.Label>
                    <SelectFixedAsset.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(
                          Array.isArray(value) ? value[0] || '' : value || '',
                        )
                      }
                      placeholder="Үндсэн хөрөнгө"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="count"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Тоо</Form.Label>
                    <Form.Control>
                      <InputNumber
                        value={field.value ?? 0}
                        onChange={(value) => field.onChange(value || 0)}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Код</Form.Label>
                    <Form.Control>
                      <Input {...field} value={field.value || ''} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="sequence"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Дараалал</Form.Label>
                    <Form.Control>
                      <InputNumber
                        value={field.value}
                        onChange={(value) => field.onChange(value || undefined)}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {mode === 'transfer' ? (
                <>
                  <Form.Field
                    control={form.control}
                    name="fromOwnerId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Хүлээлгэж өгөх</Form.Label>
                        <SelectMember.FormItem
                          mode="single"
                          value={field.value || ''}
                          onValueChange={(value) => field.onChange(value || '')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="toOwnerId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Хүлээн авах</Form.Label>
                        <SelectMember.FormItem
                          mode="single"
                          value={field.value || ''}
                          onValueChange={(value) => field.onChange(value || '')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </>
              ) : (
                <Form.Field
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Эд хариуцагч</Form.Label>
                      <SelectMember.FormItem
                        mode="single"
                        value={field.value || ''}
                        onValueChange={(value) => field.onChange(value || '')}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
            </Sheet.Content>
            <Sheet.Footer className="border-t bg-background">
              <Sheet.Close asChild>
                <Button type="button" variant="outline">
                  Болих
                </Button>
              </Sheet.Close>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner />}
                Хадгалах
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
