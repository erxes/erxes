import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Sheet,
  Input,
  Label,
  Form,
  Select,
  Combobox,
  PopoverScoped,
} from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { SelectBranches, SelectMember } from 'ui-modules';
import { SelectBoardFormItem } from '@/pos/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pos/hooks/useSelectPipeline';
import { SelectStageFormItem } from '@/pos/hooks/useSelectStage';
import { useFieldsCombined } from '@/pos/hooks/useFieldsCombined';
import { nanoid } from 'nanoid';

export interface CardConfig {
  _id?: string;
  branchId: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  assignedUserIds: string[];
  deliveryMapField: string;
  title: string;
}

interface AddConfigSheetProps {
  onConfigAdded?: (config: CardConfig) => void;
  onConfigUpdated?: (config: CardConfig) => void;
  editingConfig?: CardConfig | null;
  onEditComplete?: () => void;
}

export const AddConfigSheet: React.FC<AddConfigSheetProps> = ({
  onConfigAdded,
  onConfigUpdated,
  editingConfig,
  onEditComplete,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const { fields: mapFields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:deal',
  });

  const form = useForm<CardConfig>({
    defaultValues: {
      branchId: '',
      boardId: '',
      pipelineId: '',
      stageId: '',
      assignedUserIds: [],
      deliveryMapField: '',
      title: '',
    },
  });

  const boardId = form.watch('boardId');
  const pipelineId = form.watch('pipelineId');

  useEffect(() => {
    if (editingConfig) {
      setOpen(true);
      form.reset({
        branchId: editingConfig.branchId || '',
        boardId: editingConfig.boardId || '',
        pipelineId: editingConfig.pipelineId || '',
        stageId: editingConfig.stageId || '',
        assignedUserIds: editingConfig.assignedUserIds || [],
        deliveryMapField: editingConfig.deliveryMapField || '',
        title: editingConfig.title || '',
      });
    }
  }, [editingConfig, form]);

  const handleClose = () => {
    form.reset({
      branchId: '',
      boardId: '',
      pipelineId: '',
      stageId: '',
      assignedUserIds: [],
      deliveryMapField: '',
      title: '',
    });
    setOpen(false);
    if (editingConfig) {
      onEditComplete?.();
    }
  };

  const handleBoardChange = (value: string) => {
    form.setValue('boardId', value);
    form.setValue('pipelineId', '');
    form.setValue('stageId', '');
  };

  const handlePipelineChange = (value: string) => {
    form.setValue('pipelineId', value);
    form.setValue('stageId', '');
  };

  const generateId = () => nanoid();

  const onSubmit = (data: CardConfig) => {
    const configData: CardConfig = {
      _id: editingConfig?._id || `temporaryId${generateId()}`,
      branchId: data.branchId,
      boardId: data.boardId,
      pipelineId: data.pipelineId,
      stageId: data.stageId,
      assignedUserIds: data.assignedUserIds,
      deliveryMapField: data.deliveryMapField,
      title: data.title,
    };

    if (editingConfig) {
      onConfigUpdated?.(configData);
    } else {
      onConfigAdded?.(configData);
    }

    handleClose();
  };

  const onCancel = () => {
    handleClose();
  };

  const isEditing = !!editingConfig;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setOpen(true);
        } else {
          handleClose();
        }
      }}
    >
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button variant="outline">
            <IconPlus size={16} className="mr-2" />
            Add Config
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{isEditing ? 'Edit Config' : 'Add Config'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>
                  TITLE <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...form.register('title', {
                    required: 'Title is required',
                  })}
                  placeholder="Enter title"
                  aria-invalid={!!form.formState.errors.title}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>CHOOSE BRANCH</Label>
                <Form.Field
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <SelectBranches.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">BOARD</Label>
                  <SelectBoardFormItem
                    value={boardId}
                    onValueChange={handleBoardChange}
                    placeholder="Choose a board"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    PIPELINE
                  </Label>
                  <SelectPipelineFormItem
                    value={pipelineId}
                    onValueChange={handlePipelineChange}
                    boardId={boardId}
                    placeholder="Choose a pipeline"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">STAGE</Label>
                  <SelectStageFormItem
                    value={form.watch('stageId')}
                    onValueChange={(value) => form.setValue('stageId', value)}
                    pipelineId={pipelineId}
                    placeholder="Choose a stage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>CHOOSE ASSIGNED USERS</Label>
                <SelectMember.Provider
                  value={form.watch('assignedUserIds')}
                  onValueChange={(value) =>
                    form.setValue('assignedUserIds', value as string[])
                  }
                  mode="multiple"
                >
                  <PopoverScoped>
                    <Combobox.Trigger className="w-full h-8">
                      <SelectMember.Value placeholder="Choose team member" />
                    </Combobox.Trigger>
                    <Combobox.Content>
                      <SelectMember.Content />
                    </Combobox.Content>
                  </PopoverScoped>
                </SelectMember.Provider>
              </div>

              <div className="space-y-2">
                <Label>CHOOSE MAP FIELD</Label>
                <Select
                  value={form.watch('deliveryMapField')}
                  onValueChange={(val) =>
                    form.setValue('deliveryMapField', val)
                  }
                >
                  <Select.Trigger className="w-full" disabled={fieldsLoading}>
                    <Select.Value
                      placeholder={fieldsLoading ? 'Loading...' : 'Select...'}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {mapFields.map((field) => (
                      <Select.Item key={field.name} value={field.name}>
                        {field.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </form>
          </Form>
        </Sheet.Content>

        <Sheet.Footer className="bg-background">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button onClick={form.handleSubmit(onSubmit)}>Save</Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
