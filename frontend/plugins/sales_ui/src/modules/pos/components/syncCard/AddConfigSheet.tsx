import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState<boolean>(false);

  const { fields: mapFields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:sales.deal',
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
            {t('add-config', 'Add Config')}
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{isEditing ? t('edit-config', 'Edit Config') : t('add-config', 'Add Config')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>
                  {t('TITLE', 'TITLE')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...form.register('title', {
                    required: t('title-required', 'Title is required'),
                  })}
                  placeholder={t('enter-title', 'Enter title')}
                  aria-invalid={!!form.formState.errors.title}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('CHOOSE-BRANCH', 'CHOOSE BRANCH')}</Label>
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
                  <Label className="text-xs text-muted-foreground">{t('BOARD', 'BOARD')}</Label>
                  <SelectBoardFormItem
                    value={boardId}
                    onValueChange={handleBoardChange}
                    placeholder={t('choose-board', 'Choose a board')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t('PIPELINE', 'PIPELINE')}
                  </Label>
                  <SelectPipelineFormItem
                    value={pipelineId}
                    onValueChange={handlePipelineChange}
                    boardId={boardId}
                    placeholder={t('choose-pipeline', 'Choose a pipeline')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('STAGE', 'STAGE')}</Label>
                  <SelectStageFormItem
                    value={form.watch('stageId')}
                    onValueChange={(value) => form.setValue('stageId', value)}
                    pipelineId={pipelineId}
                    placeholder={t('choose-stage', 'Choose a stage')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('CHOOSE-ASSIGNED-USERS', 'CHOOSE ASSIGNED USERS')}</Label>
                <SelectMember.Provider
                  value={form.watch('assignedUserIds')}
                  onValueChange={(value) =>
                    form.setValue('assignedUserIds', value as string[])
                  }
                  mode="multiple"
                >
                  <PopoverScoped>
                    <Combobox.Trigger className="w-full h-8">
                      <SelectMember.Value placeholder={t('choose-team-member', 'Choose team member')} />
                    </Combobox.Trigger>
                    <Combobox.Content>
                      <SelectMember.Content />
                    </Combobox.Content>
                  </PopoverScoped>
                </SelectMember.Provider>
              </div>

              <div className="space-y-2">
                <Label>{t('CHOOSE-MAP-FIELD', 'CHOOSE MAP FIELD')}</Label>
                <Select
                  value={form.watch('deliveryMapField')}
                  onValueChange={(val) =>
                    form.setValue('deliveryMapField', val)
                  }
                >
                  <Select.Trigger className="w-full" disabled={fieldsLoading}>
                    <Select.Value
                      placeholder={fieldsLoading ? t('loading', 'Loading') : t('select-option', 'Select...')}
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
            {t('cancel', 'Cancel')}
          </Button>

          <Button onClick={form.handleSubmit(onSubmit)}>{t('save', 'Save')}</Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
