import { IconPlus } from '@tabler/icons-react';
import {
  useToast,
  Dialog,
  Button,
  Input,
  Textarea,
  Select,
  Label,
} from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { usePosAdd } from '@/pos/hooks/usePosAdd';
import { useForm } from 'react-hook-form';
import { POS_TYPES, PosType } from '@/pos/constants';

interface PosCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess?: () => void;
}

export interface PosFormData {
  name: string;
  description: string;
  type: PosType;
}

export const PosCreate = ({
  open,
  onOpenChange,
  onCreateSuccess,
}: PosCreateDialogProps) => {
  const { posAdd, loading } = usePosAdd();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PosFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: 'pos',
    },
  });

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
        },
        onError: (e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'POS created successfully.',
          });
          reset();
          onOpenChange(false);
          if (onCreateSuccess) onCreateSuccess();
        },
      });
    } catch (error) {
      console.error('Error creating POS:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full bg-primary/10">
              <IconPlus size={20} className="text-primary" />
            </div>
            <Dialog.Title className="text-lg font-bold">
              Create New POS
            </Dialog.Title>
          </div>
        </Dialog.Header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as PosType)}
              >
                <Select.Trigger>
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
          </div>

          <Dialog.Footer>
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
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
