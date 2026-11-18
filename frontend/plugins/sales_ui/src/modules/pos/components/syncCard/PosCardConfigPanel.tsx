import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconBuilding,
  IconLayoutKanban,
  IconMapPin,
  IconProgress,
  IconSandbox,
  IconTextCaption,
  IconUsers,
} from '@tabler/icons-react';
import {
  Combobox,
  Form,
  Input,
  isDefined,
  PopoverScoped,
  Select,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PanelFormLayout,
  PanelFormRow,
  SelectBranches,
  SelectMember,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';
import {
  type CardConfig,
  type CardConfigDraft,
  toCardConfigs,
  toCardsConfigInput,
} from '@/pos/components/syncCard/cardConfig';
import {
  POS_CARD_CONFIG_CONTENT_TYPE,
  POS_PANEL_INPUT_CLASS_NAME,
} from '@/pos/constants/posPanel';
import { useFieldsCombined } from '@/pos/hooks/useFieldsCombined';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { SelectBoardFormItem } from '@/pos/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pos/hooks/useSelectPipeline';
import { SelectStageFormItem } from '@/pos/hooks/useSelectStage';
import { renderPosPanelStatus } from '@/pos/components/PosPanelMissing';
import { usePosPanelSave } from '@/pos/hooks/usePosPanelSave';

type CardConfigFormValues = Omit<CardConfig, '_id'>;

const EMPTY_VALUES: CardConfigFormValues = {
  title: '',
  branchId: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  assignedUserIds: [],
  deliveryMapField: '',
};

export const PosCardConfigPanelTitle = () => {
  const { t } = useTranslation('sales');
  const { configKey } = useSidePanelDraft<CardConfigDraft>(
    POS_CARD_CONFIG_CONTENT_TYPE,
  );

  return configKey ? t('edit-config') : t('add-config');
};

export const PosCardConfigPanel = () => {
  const { t } = useTranslation('sales');
  const { posId, configKey } = useSidePanelDraft<CardConfigDraft>(
    POS_CARD_CONFIG_CONTENT_TYPE,
  );
  const { back, canGoBack, close } = useSidePanel();
  const { posDetail, loading, error } = usePosDetail(posId);
  const { fields: mapFields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:sales.deal',
  });

  const configs = useMemo(
    () => toCardConfigs(posDetail?.cardsConfig),
    [posDetail?.cardsConfig],
  );
  const editing = configs.find((config) => config._id === configKey);

  const schema = useMemo(() => {
    const takenTitles = new Set(
      configs
        .filter((config) => config._id !== configKey)
        .flatMap((config) => [config._id, config.title]),
    );

    return z.object({
      title: z
        .string()
        .trim()
        .min(1, t('title-required'))
        .refine((title) => !takenTitles.has(title), {
          message: t(
            'pos-card-config-title-taken',
            'A config with this title already exists',
          ),
        }),
      branchId: z.string(),
      boardId: z.string(),
      pipelineId: z.string(),
      stageId: z.string(),
      assignedUserIds: z.array(z.string()),
      deliveryMapField: z.string(),
    });
  }, [configs, configKey, t]);

  const form = useForm<CardConfigFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });
  const { errors } = form.formState;
  const boardId = form.watch('boardId');
  const pipelineId = form.watch('pipelineId');

  useEffect(() => {
    if (editing) {
      form.reset({
        title: editing.title,
        branchId: editing.branchId,
        boardId: editing.boardId,
        pipelineId: editing.pipelineId,
        stageId: editing.stageId,
        assignedUserIds: editing.assignedUserIds,
        deliveryMapField: editing.deliveryMapField,
      });
    }
  }, [editing, form]);

  const cancel = () => (canGoBack ? back() : close());
  const { save: savePos, saving } = usePosPanelSave({
    successMessage: t('cards-config-saved'),
    failureMessage: t('cards-config-save-failed'),
    onSaved: cancel,
  });
  const status = renderPosPanelStatus({
    missing: !posId || (!!configKey && !loading && !editing),
    loading,
    error,
    onCancel: cancel,
  });

  if (status || !posId) {
    return status;
  }

  const save = (values: CardConfigFormValues) => {
    const next: CardConfig = { ...values, _id: values.title };
    const nextConfigs = editing
      ? configs.map((config) => (config._id === configKey ? next : config))
      : [...configs, next];

    return savePos({
      _id: posId,
      cardsConfig: toCardsConfigInput(nextConfigs),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(save)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={cancel}
          saving={saving}
          saveLabel={editing ? t('save') : t('add-config')}
        >
          <PanelFormRow
            icon={IconTextCaption}
            label={t('title')}
            required
            error={errors.title?.message}
          >
            <Input
              {...form.register('title')}
              placeholder={t('enter-title')}
              className={POS_PANEL_INPUT_CLASS_NAME}
              aria-invalid={!!errors.title}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconBuilding} label={t('branch')}>
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
          </PanelFormRow>
          <PanelFormRow icon={IconSandbox} label={t('board')}>
            <SelectBoardFormItem
              value={boardId}
              onValueChange={(value) => {
                form.setValue('boardId', value);
                form.setValue('pipelineId', '');
                form.setValue('stageId', '');
              }}
              placeholder={t('choose-board')}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconLayoutKanban} label={t('pipeline')}>
            <SelectPipelineFormItem
              value={pipelineId}
              onValueChange={(value) => {
                form.setValue('pipelineId', value);
                form.setValue('stageId', '');
              }}
              boardId={boardId}
              placeholder={t('choose-pipeline')}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconProgress} label={t('stage')}>
            <SelectStageFormItem
              value={form.watch('stageId')}
              onValueChange={(value) => form.setValue('stageId', value)}
              pipelineId={pipelineId}
              placeholder={t('choose-stage')}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconUsers} label={t('assigned-to')}>
            <SelectMember.Provider
              value={form.watch('assignedUserIds')}
              onValueChange={(value) =>
                form.setValue(
                  'assignedUserIds',
                  (Array.isArray(value) ? value : [value]).filter(isDefined),
                )
              }
              mode="multiple"
            >
              <PopoverScoped>
                <Combobox.Trigger className="w-full">
                  <SelectMember.Value placeholder={t('choose-team-member')} />
                </Combobox.Trigger>
                <Combobox.Content>
                  <SelectMember.Content />
                </Combobox.Content>
              </PopoverScoped>
            </SelectMember.Provider>
          </PanelFormRow>
          <PanelFormRow
            icon={IconMapPin}
            label={t('pos-card-map-field', 'Map field')}
          >
            <Select
              value={form.watch('deliveryMapField')}
              onValueChange={(value) =>
                form.setValue('deliveryMapField', value)
              }
            >
              <Select.Trigger className="w-full" disabled={fieldsLoading}>
                <Select.Value
                  placeholder={
                    fieldsLoading ? t('loading') : t('select-option')
                  }
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
          </PanelFormRow>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
