import {
  useToast,
  Sheet,
  Button,
  Input,
  Textarea,
  Select,
  Label,
  Form,
} from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { usePosAdd } from '@/pos/hooks/usePosAdd';
import { useForm } from 'react-hook-form';
import { POS_TYPES, PosType } from '@/pos/constants';
import { EcommerceFields } from './EcommerceFields';
import { PosFields } from './PosFields';
import { RestaurantFields } from './RestaurantFields';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { usePosEditProductGroup } from '@/pos/hooks/usePosEditProductGroup';
import { useRef } from 'react';
import type { CustomNode } from '@/pos/slot/types';
import { useUpdatePosSlots } from '@/pos/hooks/useSlotAdd';

interface PosCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess?: () => void;
}

export interface PosFormData {
  name: string;
  description: string;
  type: PosType | '';
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
  const { posAdd, loading } = usePosAdd();
  const { toast } = useToast();
  const { productGroupSave } = usePosEditProductGroup();
  const { updatePosSlots } = useUpdatePosSlots();
  const productGroupsRef = useRef<ProductGroup[]>([]);
  const slotsRef = useRef<CustomNode[]>([]);

  const methods = useForm<PosFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: '',
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
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const selectedType = watch('type');
  const selectedName = watch('name');

  const isFormValid = selectedName?.trim().length >= 2 && selectedType;

  const onSubmit = async (data: PosFormData) => {
    try {
      await posAdd({
        variables: {
          name: data.name,
          description: data.description,
          type: data.type,
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
            title: 'Error',
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
                title: 'Warning',
                description:
                  'POS created but failed to save product groups. You can add them later.',
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
                title: 'Warning',
                description:
                  'POS created but failed to save slots. You can add them later.',
                variant: 'destructive',
              });
            }
          }

          toast({
            title: 'Success',
            description: 'POS created successfully.',
          });
          reset();
          productGroupsRef.current = [];
          slotsRef.current = [];
          onOpenChange(false);
          if (onCreateSuccess) onCreateSuccess();
        },
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create POS. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="flex-col p-0 h-full max-h-screen sm:max-w-md">
        <Sheet.Header className="px-5 shrink-0">
          <Sheet.Title className="text-lg font-bold">Create POS</Sheet.Title>
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
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter POS name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
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
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter POS description"
                  rows={3}
                  {...register('description')}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    setValue('type', value as PosType, { shouldValidate: true })
                  }
                >
                  <Select.Trigger className="bg-background">
                    <Select.Value placeholder="Select POS type" />
                  </Select.Trigger>
                  <Select.Content>
                    {POS_TYPES.map((type) => (
                      <Select.Item key={type.value} value={type.value}>
                        {type.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>

                {errors.type && (
                  <p className="text-sm text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {selectedType === 'ecommerce' && (
                <EcommerceFields
                  form={methods}
                  productGroupsRef={productGroupsRef}
                />
              )}

              {selectedType === 'pos' && (
                <PosFields form={methods} productGroupsRef={productGroupsRef} />
              )}

              {selectedType === 'restaurant' && (
                <RestaurantFields
                  form={methods}
                  productGroupsRef={productGroupsRef}
                  slotsRef={slotsRef}
                />
              )}
            </div>

            <Sheet.Footer className="px-5 py-4 border-t bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isFormValid}>
                {loading ? 'Creating...' : 'Create POS'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
