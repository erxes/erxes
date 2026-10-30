import { useDealsAdd } from '@/deals/cards/hooks/useDeals';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { salesFormSchema } from '@/deals/constants/formSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { Editor, Form, Input, Spinner } from 'erxes-ui';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  PropertyFormField,
  SelectBoard,
  SelectCompany,
  SelectCustomer,
  SelectMember,
  SelectPipeline,
  SelectStage,
  isFieldVisibleByLogic,
  useFields,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';

export type TDealDraft = {
  boardId?: string | null;
  pipelineId?: string | null;
  stageId?: string | null;
  customerId?: string | null;
  companyId?: string | null;
};

const dealDraftSchema = salesFormSchema.extend({
  name: z.string().trim().min(1),
  boardId: z.string().nullable().optional(),
  pipelineId: z.string().nullable().optional(),
  stageId: z.string().min(1),
});

type TDealDraftForm = z.infer<typeof dealDraftSchema>;

const toSingleId = (value?: string | string[] | null) =>
  (Array.isArray(value) ? value[0] : value) || null;

const DealDraftProperties = ({
  propertiesData,
  onFieldChange,
}: {
  propertiesData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) => {
  const { fields, loading } = useFields({ contentType: 'sales:deal' });
  const visibleFields = fields
    .filter((field) => field.isVisibleToCreate)
    .filter((field) => isFieldVisibleByLogic(field, propertiesData));

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (!visibleFields.length) {
    return null;
  }

  return (
    <div className="grid gap-3 pt-3">
      {visibleFields.map((field) => (
        <PropertyFormField
          key={field._id}
          field={field}
          value={propertiesData[field._id]}
          idPrefix="deal_add_form"
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
};

export const DealPanelNew = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const draft = useSidePanelDraft<TDealDraft>('sales:deal');
  const { back, canGoBack, close } = useSidePanel();
  const { addDeals, loading } = useDealsAdd();
  const form = useForm<TDealDraftForm>({
    resolver: zodResolver(dealDraftSchema),
    defaultValues: {
      name: '',
      description: '',
      assignedUserIds: [],
      labelIds: [],
      tagIds: [],
      propertiesData: {},
      boardId: draft.boardId ?? null,
      pipelineId: draft.pipelineId ?? null,
      stageId: draft.stageId ?? '',
      customerId: draft.customerId ?? null,
      companyId: draft.companyId ?? null,
    },
  });
  const { errors } = form.formState;
  const [boardId, pipelineId, propertiesData] = form.watch([
    'boardId',
    'pipelineId',
    'propertiesData',
  ]);
  const hasStage = !!draft.stageId;

  const finish = () => (canGoBack ? back() : close());

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) => {
      const current = form.getValues('propertiesData') || {};
      form.setValue('propertiesData', { ...current, [fieldId]: value });
    },
    [form],
  );

  const onSubmit = (values: TDealDraftForm) => {
    const cleanPropertiesData = Object.fromEntries(
      Object.entries(values.propertiesData || {}).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );

    addDeals({
      variables: {
        name: values.name,
        description: values.description,
        stageId: values.stageId,
        assignedUserIds: values.assignedUserIds,
        labelIds: values.labelIds,
        tagIds: values.tagIds,
        customerId: values.customerId,
        companyId: values.companyId,
        propertiesData: Object.keys(cleanPropertiesData).length
          ? cleanPropertiesData
          : undefined,
      },
      update: (cache) => cache.evict({ id: 'ROOT_QUERY', fieldName: 'deals' }),
      onCompleted: finish,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PanelFormLayout
          onCancel={finish}
          saving={loading}
          saveLabel={t('save')}
        >
          <PanelFormRow
            label={t('name')}
            required
            error={errors.name ? t('name-required') : undefined}
          >
            <Input
              {...form.register('name')}
              autoFocus
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          {!hasStage && (
            <>
              <PanelFormRow label={t('board')}>
                <SelectBoard.FormItem
                  mode="single"
                  value={boardId ?? undefined}
                  onValueChange={(value) => {
                    form.setValue('boardId', toSingleId(value));
                    form.setValue('pipelineId', null);
                    form.setValue('stageId', '');
                  }}
                />
              </PanelFormRow>
              <PanelFormRow label={t('pipeline')}>
                <SelectPipeline.FormItem
                  mode="single"
                  boardId={boardId ?? undefined}
                  value={pipelineId ?? undefined}
                  onValueChange={(value) => {
                    form.setValue('pipelineId', toSingleId(value));
                    form.setValue('stageId', '');
                  }}
                />
              </PanelFormRow>
            </>
          )}
          <PanelFormRow
            label={t('stage')}
            required
            error={errors.stageId ? t('stage-required') : undefined}
          >
            <SelectStage.FormItem
              mode="single"
              pipelineId={pipelineId ?? undefined}
              value={form.watch('stageId') || undefined}
              onValueChange={(value) =>
                form.setValue('stageId', toSingleId(value) || '', {
                  shouldValidate: true,
                })
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('assigned-to')}>
            <SelectMember.FormItem
              mode="multiple"
              value={form.watch('assignedUserIds')}
              onValueChange={(value) =>
                form.setValue(
                  'assignedUserIds',
                  (Array.isArray(value) ? value : [value]).filter(
                    (id): id is string => !!id,
                  ),
                )
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('labels')}>
            <SelectLabels.FormItem
              mode="multiple"
              value={form.watch('labelIds')}
              onValueChange={(value) =>
                form.setValue(
                  'labelIds',
                  (Array.isArray(value) ? value : [value]).filter(
                    (id): id is string => !!id,
                  ),
                )
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('customers')}>
            <SelectCustomer.FormItem
              mode="single"
              value={form.watch('customerId') ?? undefined}
              onValueChange={(value) =>
                form.setValue('customerId', toSingleId(value))
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('companies')}>
            <SelectCompany
              mode="single"
              value={form.watch('companyId') ?? undefined}
              onValueChange={(value) =>
                form.setValue('companyId', toSingleId(value))
              }
            />
          </PanelFormRow>
          <div className="flex flex-col gap-1 pt-3">
            <span className="text-xs font-medium text-accent-foreground">
              {t('description')}
            </span>
            <Editor
              initialContent={form.getValues('description')}
              onChange={(value) => form.setValue('description', value)}
              scope="sales-add-panel-description-field"
            />
          </div>
          <DealDraftProperties
            propertiesData={propertiesData || {}}
            onFieldChange={updateCustomFieldValue}
          />
          <button
            type="button"
            onClick={() => navigate('/settings/properties/sales:deal')}
            className="mt-3 flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-info/40 bg-info/10 px-3 py-2.5 text-left text-xs text-info hover:bg-info/15"
          >
            <IconInfoCircle className="mt-0.5 size-3.5 shrink-0" />
            <span className="leading-5 underline underline-offset-2">
              {t('configure-properties-in-settings')}
            </span>
          </button>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
