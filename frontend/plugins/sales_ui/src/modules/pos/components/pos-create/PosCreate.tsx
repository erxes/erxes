import {
  useToast,
  Sheet,
  Button,
  Input,
  Textarea,
  Label,
  Form,
} from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { usePosAdd } from '@/pos/hooks/usePosAdd';
import { useForm } from 'react-hook-form';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { usePosEditProductGroup } from '@/pos/hooks/usePosEditProductGroup';
import { useRef, useState } from 'react';
import type { CustomNode } from '@/pos/slot/types';
import { useUpdatePosSlots } from '@/pos/hooks/useSlotAdd';
import { useTranslation } from 'react-i18next';

interface PosCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess?: () => void;
}

export interface PosFormData {
  name: string;
  description: string;
  branchId?: string;
  paymentIds?: string[];
  adminIds?: string[];
  cashierIds?: string[];
  initialCategoryIds?: string[];
  slots?: number | string;
}

export const PosCreate = ({
  open,
  onOpenChange,
  onCreateSuccess,
}: PosCreateDialogProps) => {
  const { posAdd } = usePosAdd();
  const { toast } = useToast();
  const { productGroupSave } = usePosEditProductGroup();
  const { updatePosSlots } = useUpdatePosSlots();
  const productGroupsRef = useRef<ProductGroup[]>([]);
  const slotsRef = useRef<CustomNode[]>([]);
  const { t } = useTranslation('sales');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<PosFormData>({
    defaultValues: {
      name: '',
      description: '',
      branchId: '',
      paymentIds: [],
      adminIds: [],
      cashierIds: [],
      initialCategoryIds: [],
      slots: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const selectedName = watch('name');

  const isFormValid = selectedName?.trim().length >= 2;

  const onSubmit = async (data: PosFormData) => {
    setIsSubmitting(true);
    try {
      await posAdd({
        variables: {
          name: data.name,
          description: data.description,
          branchId: data.branchId || undefined,
          paymentIds:
            data.paymentIds && data.paymentIds.length > 0
              ? data.paymentIds
              : undefined,
          adminIds:
            data.adminIds && data.adminIds.length > 0
              ? data.adminIds
              : undefined,
          cashierIds:
            data.cashierIds && data.cashierIds.length > 0
              ? data.cashierIds
              : undefined,
          initialCategoryIds:
            data.initialCategoryIds && data.initialCategoryIds.length > 0
              ? data.initialCategoryIds
              : undefined,
        },
        onError: (e: ApolloError) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: async (result) => {
          const posId = result?.posAdd?._id;

          if (posId && productGroupsRef.current.length > 0) {
            try {
              await productGroupSave(
                {
                  variables: {
                    posId,
                    groups: productGroupsRef.current,
                  },
                },
                ['groups'],
              );
            } catch {
              toast({
                title: t('warning'),
                description: t('pos-create-product-groups-failed'),
                variant: 'destructive',
              });
            }
          }

          if (posId && slotsRef.current.length > 0) {
            try {
              const slotsData = slotsRef.current.map((node) => {
                const x = node.position?.x ?? node.data.positionX ?? 0;
                const y = node.position?.y ?? node.data.positionY ?? 0;

                return {
                  _id: node.id,
                  posId,
                  name: node.data.label || `TABLE ${node.id}`,
                  code: node.data.code || node.id,
                  option: {
                    width: node.data.width || 80,
                    height: node.data.height || 80,
                    top: y,
                    left: x,
                    rotateAngle: node.data.rotateAngle || 0,
                    borderRadius: Number(node.data.rounded) || 0,
                    color: node.data.color || '#4F46E5',
                    zIndex: node.data.zIndex || 0,
                    isShape: false,
                  },
                };
              });

              await updatePosSlots({
                variables: {
                  posId,
                  slots: slotsData,
                },
              });
            } catch {
              toast({
                title: t('warning'),
                description: t('pos-create-slots-failed'),
                variant: 'destructive',
              });
            }
          }

          toast({
            title: t('success'),
            description: t('pos-create-success'),
          });
          reset();
          productGroupsRef.current = [];
          slotsRef.current = [];
          onOpenChange(false);
          if (onCreateSuccess) onCreateSuccess();
          setIsSubmitting(false);
        },
      });
    } catch {
      toast({
        title: t('error'),
        description: t('pos-create-failed'),
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    productGroupsRef.current = [];
    slotsRef.current = [];
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      productGroupsRef.current = [];
      slotsRef.current = [];
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View className="flex-col p-0 h-full max-h-screen sm:max-w-md">
        <Sheet.Header className="px-5 shrink-0">
          <Sheet.Title className="text-lg font-bold">{t('pos-create')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0 bg-background"
          >
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4 min-h-0">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t('name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t('pos-name-placeholder')}
                  {...register('name', {
                    required: t('name-required'),
                    minLength: {
                      value: 2,
                      message: t('name-min-length'),
                    },
                  })}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  {t('description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('pos-description-placeholder')}
                  rows={3}
                  {...register('description')}
                  className="bg-background"
                />
              </div>

            </div>

            <Sheet.Footer className="px-5 py-4 border-t bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !isFormValid}>
                {isSubmitting ? t('creating') : t('pos-create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
