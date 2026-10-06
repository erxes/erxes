import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
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

const ownerRecordActionSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      fixedAssetId: z.string().refine(
        (value) => value.length >= 1,
        () => ({ message: t('select-a-fixed-asset') }),
      ),
      code: z.string().optional(),
      sequence: z.number().optional(),
      count: z.number().refine(
        (value) => value > 0,
        () => ({
          message: t('quantity-must-be-greater-than-zero'),
        }),
      ),
      ownerId: z.string().optional(),
      fromOwnerId: z.string().optional(),
      toOwnerId: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (!value.ownerId && !value.fromOwnerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('select-an-asset-custodian'),
          path: ['ownerId'],
        });
      }

      if (value.fromOwnerId !== undefined && !value.toOwnerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('select-the-receiving-custodian'),
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
          message: t(
            'the-transferring-and-receiving-custodians-must-be-different',
          ),
          path: ['toOwnerId'],
        });
      }
    });

type TOwnerRecordActionForm = z.infer<
  ReturnType<typeof ownerRecordActionSchema>
>;

type TActionMode = 'receive' | 'transfer' | 'handOver';

const ACTION_LABELS: Record<TActionMode, string> = {
  receive: 'assign-to-custodian',
  transfer: 'transfer-custody',
  handOver: 'release-from-custody',
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
  const { t } = useTranslation('accounting');

  const [open, setOpen] = useState(false);
  const { addFixedAssetOwnerRecord, loading: addLoading } =
    useFixedAssetOwnerRecordAdd();
  const { transferFixedAssetOwnerRecord, loading: transferLoading } =
    useFixedAssetOwnerRecordTransfer();
  const loading = addLoading || transferLoading;
  const form = useForm<TOwnerRecordActionForm>({
    resolver: zodResolver(ownerRecordActionSchema(t)),
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
      title: t('required-information-is-missing'),
      description: t('review-the-fixed-asset-quantity-and-custodian'),
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
          <Sheet.Title>{t(ACTION_LABELS[mode])}</Sheet.Title>
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
                    <Form.Label>{t('fixed-asset')}</Form.Label>
                    <SelectFixedAsset.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(
                          Array.isArray(value) ? value[0] || '' : value || '',
                        )
                      }
                      placeholder={t('fixed-asset')}
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
                    <Form.Label>{t('quantity')}</Form.Label>
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
                    <Form.Label>{t('code')}</Form.Label>
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
                    <Form.Label>{t('sequence')}</Form.Label>
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
                        <Form.Label>{t('hand-over')}</Form.Label>
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
                        <Form.Label>{t('receive')}</Form.Label>
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
                      <Form.Label>{t('asset-custodian')}</Form.Label>
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
                  {t('cancel')}
                </Button>
              </Sheet.Close>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner />}
                {t('save')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
