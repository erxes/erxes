import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectTeam } from '@/team/components/SelectTeam';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import {
  TTriageDraft,
  useCreateTriageRecord,
} from '@/triage/hooks/useCreateTriageRecord';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor, Form, Input } from 'erxes-ui';
import { Path, PathValue, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ContactsRelationField,
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';

const SCOPE = 'side-panel-triage-new';

const triageDraftSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  teamId: z.string().min(1, 'Team is required'),
  priority: z.number().optional(),
  description: z.string().optional(),
  customerId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

type TTriageDraftForm = z.infer<typeof triageDraftSchema>;

/**
 * A triage not created yet, drawn like its Detail tab with what the draft
 * started with (its triage team, the customer it is for). Nothing is saved
 * until Save; the triage then replaces the draft. Cancel leaves nothing.
 */
export const TriagePanelNew = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<TTriageDraft>(TRIAGE_CONTENT_TYPE);
  const { createTriageRecord, loading } = useCreateTriageRecord();
  const { back, canGoBack, close } = useSidePanel();
  const form = useForm<TTriageDraftForm>({
    resolver: zodResolver(triageDraftSchema),
    defaultValues: {
      name: '',
      teamId: draft.teamId || '',
      priority: draft.priority ?? 0,
      customerId: draft.customerId ?? null,
      companyId: draft.companyId ?? null,
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const set = <K extends Path<TTriageDraftForm>>(
    name: K,
    value: PathValue<TTriageDraftForm, K>,
  ) => form.setValue(name, value, { shouldValidate: name === 'teamId' });

  const cancel = () => (canGoBack ? back() : close());

  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(createTriageRecord)}
      >
        <PanelFormLayout
          onCancel={cancel}
          saving={loading}
          saveLabel={t('add-triage')}
        >
          <PanelFormRow
            label={t('name', 'Name')}
            required
            error={errors.name?.message}
          >
            <Input
              {...form.register('name')}
              autoFocus
              placeholder={t('triage-name')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <PanelFormRow label={t('priority')}>
            <SelectPriority.FormItem
              variant="table"
              value={values.priority ?? 0}
              onValueChange={(priority) => set('priority', priority)}
            />
          </PanelFormRow>
          <PanelFormRow
            label={t('team')}
            required
            error={errors.teamId?.message}
          >
            <SelectTeam.FormItem
              variant="table"
              mode="single"
              isTriageEnabled
              value={values.teamId}
              onValueChange={(teamId) =>
                set('teamId', Array.isArray(teamId) ? teamId[0] : teamId)
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('customers', 'Customers')}>
            <ContactsRelationField
              kind="customer"
              scope={`${SCOPE}.customer`}
              value={values.customerId}
              onValueChange={(id) => set('customerId', id)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('companies', 'Companies')}>
            <ContactsRelationField
              kind="company"
              scope={`${SCOPE}.company`}
              value={values.companyId}
              onValueChange={(id) => set('companyId', id)}
            />
          </PanelFormRow>
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-xs font-medium text-accent-foreground">
              {t('description', 'Description')}
            </span>
            <Editor
              onChange={(description) => set('description', description)}
              scope={`${SCOPE}.description`}
            />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
