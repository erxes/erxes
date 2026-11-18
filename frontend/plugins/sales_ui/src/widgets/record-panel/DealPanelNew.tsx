import { useDealsAdd } from '@/deals/cards/hooks/useDeals';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { formatDealDateForMutation } from '@/deals/components/deal-selects/dateSelectUtils';
import { SelectPriority } from '@/deals/components/deal-selects/SelectPriority';
import { salesFormSchema } from '@/deals/constants/formSchema';
import { getPriorityName } from '@/deals/utils/dealPriority';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconAlignLeft,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarDue,
  IconFlag,
  IconGitBranch,
  IconInfoCircle,
  IconLabel,
  IconLayoutKanban,
  IconProgress,
  IconTimeline,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { Editor, Form, Input, Spinner } from 'erxes-ui';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DataExtensionCreateFields,
  PANEL_INPUT_CLASS_NAME,
  PanelField,
  PanelFormLayout,
  PanelFormRow,
  PropertyFormField,
  isFieldVisibleByLogic,
  useFields,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';
import { DealDetailSection } from '~/widgets/record-panel/DealDetailSection';
import { DealBrokerFields } from '~/widgets/record-panel/DealPanelBroker';
import {
  DealPanelBoardCell,
  DealPanelBranchesCell,
  DealPanelCompanyCell,
  DealPanelCustomerCell,
  DealPanelDepartmentsCell,
  DealPanelLabelsCell,
  DealPanelMemberCell,
  DealPanelPipelineCell,
  DealPanelStageCell,
} from '~/widgets/record-panel/DealPanelCells';
import { DealTagsSection } from '~/widgets/record-panel/DealPanelDetail';
import { toList } from '~/widgets/record-panel/useDealListField';

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
  priority: z.number().optional(),
  startDate: z.date().optional(),
  closeDate: z.date().optional(),
  brokerType: z.string().optional(),
  brokerId: z.string().optional(),
  branchIds: z.array(z.string()).optional(),
  departmentIds: z.array(z.string()).optional(),
});

const DEAL_DRAFT_SCOPE = 'side-panel-deal-new';

type TDealDraftForm = z.infer<typeof dealDraftSchema>;

const toSingleId = (value?: string | string[] | null) =>
  (Array.isArray(value) ? value[0] : value) || null;

const toBrokerType = (value: string) =>
  value === 'customer' || value === 'company' || value === 'user' ? value : '';

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

const DealPanelNewForm = ({ draft }: { draft: Partial<TDealDraft> }) => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const { back, canGoBack, close } = useSidePanel();
  const form = useForm<TDealDraftForm>({
    resolver: zodResolver(dealDraftSchema),
    defaultValues: {
      name: '',
      description: '',
      assignedUserIds: [],
      labelIds: [],
      tagIds: [],
      branchIds: [],
      departmentIds: [],
      brokerType: '',
      brokerId: '',
      propertiesData: {},
      boardId: draft.boardId ?? null,
      pipelineId: draft.pipelineId ?? null,
      stageId: draft.stageId ?? '',
      customerId: draft.customerId ?? null,
      companyId: draft.companyId ?? null,
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const pipelineId = values.pipelineId ?? undefined;
  const hasStage = !!draft.stageId;

  const finish = () => (canGoBack ? back() : close());
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const frame = requestAnimationFrame(() => form.setFocus('name'));
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frame);
    };
  }, [form]);

  const { addDeals, loading } = useDealsAdd({
    onCompleted: () => {
      if (mountedRef.current) finish();
    },
  });

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) => {
      const current = form.getValues('propertiesData') || {};
      form.setValue('propertiesData', { ...current, [fieldId]: value });
    },
    [form],
  );

  const setList =
    (
      key:
        | 'assignedUserIds'
        | 'labelIds'
        | 'tagIds'
        | 'branchIds'
        | 'departmentIds',
    ) =>
    (value: string | string[]) =>
      form.setValue(key, toList(value).filter(Boolean));

  const onSubmit = (submitted: TDealDraftForm) => {
    const cleanPropertiesData = Object.fromEntries(
      Object.entries(submitted.propertiesData || {}).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
    const hasBroker = !!submitted.brokerType && !!submitted.brokerId;

    addDeals({
      variables: {
        name: submitted.name,
        description: submitted.description,
        stageId: submitted.stageId,
        assignedUserIds: submitted.assignedUserIds,
        labelIds: submitted.labelIds,
        tagIds: submitted.tagIds,
        branchIds: submitted.branchIds,
        departmentIds: submitted.departmentIds,
        customerId: submitted.customerId,
        companyId: submitted.companyId,
        priority: submitted.priority
          ? getPriorityName(submitted.priority)
          : undefined,
        startDate: formatDealDateForMutation(submitted.startDate),
        closeDate: formatDealDateForMutation(submitted.closeDate),
        brokerType: hasBroker ? submitted.brokerType : undefined,
        brokerId: hasBroker ? submitted.brokerId : undefined,
        propertiesData: Object.keys(cleanPropertiesData).length
          ? cleanPropertiesData
          : undefined,
      },
      update: (cache) => cache.evict({ id: 'ROOT_QUERY', fieldName: 'deals' }),
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
          <div className="grid gap-5 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-3">
            <div className="flex min-w-0 flex-col">
              <DealDetailSection title={t('general')} nested>
                <PanelFormRow
                  icon={IconAlignLeft}
                  label={t('name')}
                  required
                  error={errors.name ? t('name-required') : undefined}
                >
                  <Input
                    {...form.register('name')}
                    placeholder={t('deal-name')}
                    className={PANEL_INPUT_CLASS_NAME}
                  />
                </PanelFormRow>
                {!hasStage && (
                  <>
                    <PanelField icon={IconLayoutKanban} label={t('board')}>
                      <DealPanelBoardCell
                        value={values.boardId ?? undefined}
                        placeholder={t('board')}
                        onValueChange={(value) => {
                          form.setValue('boardId', toSingleId(value));
                          form.setValue('pipelineId', null);
                          form.setValue('stageId', '');
                          form.setValue('labelIds', []);
                        }}
                      />
                    </PanelField>
                    <PanelField icon={IconTimeline} label={t('pipeline')}>
                      <DealPanelPipelineCell
                        boardId={values.boardId ?? undefined}
                        value={pipelineId}
                        placeholder={t('pipeline')}
                        onValueChange={(value) => {
                          const nextPipelineId = toSingleId(value);
                          if (nextPipelineId === form.getValues('pipelineId')) {
                            return;
                          }
                          form.setValue('pipelineId', nextPipelineId);
                          form.setValue('stageId', '');
                          form.setValue('labelIds', []);
                        }}
                      />
                    </PanelField>
                  </>
                )}
                <PanelFormRow
                  icon={IconProgress}
                  label={t('stage')}
                  required
                  error={errors.stageId ? t('stage-required') : undefined}
                >
                  <DealPanelStageCell
                    pipelineId={pipelineId}
                    value={values.stageId || undefined}
                    onValueChange={(value) =>
                      form.setValue('stageId', toSingleId(value) || '', {
                        shouldValidate: true,
                      })
                    }
                  />
                </PanelFormRow>
                <PanelField icon={IconUser} label={t('assigned-to')}>
                  <DealPanelMemberCell
                    value={values.assignedUserIds}
                    onValueChange={setList('assignedUserIds')}
                  />
                </PanelField>
                <PanelField icon={IconFlag} label={t('priority')}>
                  <SelectPriority
                    value={values.priority ?? 0}
                    variant="table"
                    badge={false}
                    scope={`${DEAL_DRAFT_SCOPE}.priority`}
                    onValueChange={(value) => form.setValue('priority', value)}
                  />
                </PanelField>
                <PanelField icon={IconLabel} label={t('labels')}>
                  <DealPanelLabelsCell
                    pipelineId={pipelineId}
                    value={values.labelIds || []}
                    onValueChange={setList('labelIds')}
                  />
                </PanelField>
              </DealDetailSection>
              <DealDetailSection title={t('schedule')} nested>
                <PanelField icon={IconCalendar} label={t('start-date')}>
                  <DateSelectDeal
                    value={values.startDate}
                    type="startDate"
                    scope={`${DEAL_DRAFT_SCOPE}.startDate`}
                    placeholder={t('start-date')}
                    onValueChange={(value) => form.setValue('startDate', value)}
                  />
                </PanelField>
                <PanelField icon={IconCalendarDue} label={t('close-date')}>
                  <DateSelectDeal
                    value={values.closeDate}
                    type="closeDate"
                    scope={`${DEAL_DRAFT_SCOPE}.closeDate`}
                    placeholder={t('close-date')}
                    onValueChange={(value) => form.setValue('closeDate', value)}
                  />
                </PanelField>
              </DealDetailSection>
              <DealDetailSection title={t('organization')} nested>
                <DealBrokerFields
                  type={values.brokerType || ''}
                  id={values.brokerId || ''}
                  onTypeChange={(value) => {
                    form.setValue('brokerType', toBrokerType(value));
                    form.setValue('brokerId', '');
                  }}
                  onIdChange={(value) => form.setValue('brokerId', value)}
                />
                <PanelField icon={IconGitBranch} label={t('branch')}>
                  <DealPanelBranchesCell
                    value={values.branchIds}
                    onValueChange={setList('branchIds')}
                  />
                </PanelField>
                <PanelField
                  icon={IconBuildingSkyscraper}
                  label={t('department')}
                >
                  <DealPanelDepartmentsCell
                    value={values.departmentIds}
                    onValueChange={setList('departmentIds')}
                  />
                </PanelField>
              </DealDetailSection>
              <DealTagsSection
                value={values.tagIds || []}
                scope={`${DEAL_DRAFT_SCOPE}.tags`}
                onValueChange={setList('tagIds')}
              />
              <DealDetailSection title={t('customers')}>
                <PanelField icon={IconUsers} label={t('customer')}>
                  <DealPanelCustomerCell
                    value={values.customerId ?? undefined}
                    placeholder={t('customer')}
                    onValueChange={(value) =>
                      form.setValue('customerId', toSingleId(value))
                    }
                  />
                </PanelField>
              </DealDetailSection>
              <DealDetailSection title={t('companies')}>
                <PanelField icon={IconBuilding} label={t('company')}>
                  <DealPanelCompanyCell
                    value={values.companyId ?? undefined}
                    placeholder={t('company')}
                    onValueChange={(value) =>
                      form.setValue('companyId', toSingleId(value))
                    }
                  />
                </PanelField>
              </DealDetailSection>
            </div>
            <div className="flex min-w-0 flex-col gap-2 border-t pt-4 @3xl/record-panel:border-t-0 @3xl/record-panel:pt-0">
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
                  <IconAlignLeft
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {t('description')}
                </span>
                <Editor
                  initialContent={form.getValues('description')}
                  onChange={(value) => form.setValue('description', value)}
                  scope="sales-add-panel-description-field"
                  className="h-auto min-h-20 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
                />
              </div>
              <DealDraftProperties
                propertiesData={values.propertiesData || {}}
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
              <DataExtensionCreateFields
                recordType="sales:deal"
                layout="stack"
                className="mt-4"
              />
            </div>
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};

export const DealPanelNew = () => {
  const draft = useSidePanelDraft<TDealDraft>('sales:deal');

  return <DealPanelNewForm key={JSON.stringify(draft)} draft={draft} />;
};
