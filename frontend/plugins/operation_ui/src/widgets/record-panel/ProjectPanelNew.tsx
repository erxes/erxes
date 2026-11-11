import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { DateSelect, SelectLead } from '@/project/components/select';
import { PROJECT_CONTENT_TYPE } from '@/project/constants/contentType';
import { useProjectDraftForm } from '@/project/hooks/useProjectDraftForm';
import { TProjectDraft } from '@/project/utils/projectDraft';
import { SelectTeam } from '@/team/components/SelectTeam';
import { BlockEditor, Form, IconPicker, Input, Spinner } from 'erxes-ui';
import { Path, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ContactsRelationField,
  DataExtensionCreateFields,
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  SelectMember,
  TagsSelect,
  useSidePanel,
} from 'ui-modules';

export const ProjectPanelNew = () => {
  const { t } = useTranslation('operation');
  const { form, editor, ready, loading, onSubmit } = useProjectDraftForm();
  const { back, canGoBack, close } = useSidePanel();
  const values = form.watch();
  const { errors } = form.formState;
  const scope = 'side-panel-project-new';
  const set = <K extends Path<TProjectDraft>>(
    name: K,
    value: PathValue<TProjectDraft, K>,
  ): void =>
    form.setValue(name, value, { shouldDirty: true, shouldValidate: true });

  return (
    <Form {...form}>
      <form className="flex flex-1 min-h-0 flex-col" onSubmit={onSubmit}>
        <PanelFormLayout
          saving={loading || !ready}
          onCancel={() => (canGoBack ? back() : close())}
          saveLabel={t('create-project', 'Create project')}
        >
          <PanelFormRow
            label={t('name', 'Name')}
            required
            error={errors.name?.message}
          >
            <Input
              {...form.register('name')}
              autoFocus
              placeholder={t('project-name')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <PanelFormRow label={t('icon')}>
            <IconPicker
              value={values.icon}
              variant="ghost"
              size="icon"
              className="size-7"
              onValueChange={(icon) => set('icon', icon || 'IconBox')}
            />
          </PanelFormRow>
          <PanelFormRow label={t('status')}>
            <SelectStatus
              value={values.status}
              variant="table"
              onValueChange={(value) => set('status', value)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('priority')}>
            <SelectPriority
              value={values.priority}
              variant="table"
              onValueChange={(value) => set('priority', value)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('lead')}>
            <SelectLead.InlineCell
              value={values.leadId}
              teamIds={values.teamIds}
              scope={`${scope}.lead`}
              onValueChange={(value) =>
                set('leadId', typeof value === 'string' ? value : undefined)
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('members')}>
            <SelectMember.InlineCell
              mode="multiple"
              value={values.memberIds || []}
              scope={`${scope}.members`}
              placeholder={t('members-not-specified')}
              onValueChange={(value) =>
                set('memberIds', Array.isArray(value) ? value : [])
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('start-date')}>
            <DateSelect.InlineCell
              value={values.startDate}
              scope={`${scope}.startDate`}
              onValueChange={(value) => set('startDate', value)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('target-date')}>
            <DateSelect.InlineCell
              value={values.targetDate}
              scope={`${scope}.targetDate`}
              onValueChange={(value) => set('targetDate', value)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('team')}>
            <SelectTeam.FormItem
              variant="table"
              value={values.teamIds}
              onValueChange={(value) =>
                set('teamIds', Array.isArray(value) ? value : [value])
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('tags')}>
            <TagsSelect.InlineCell
              type={PROJECT_CONTENT_TYPE}
              mode="multiple"
              value={values.tagIds || []}
              scope={`${scope}.tags`}
              onValueChange={(value) =>
                set('tagIds', Array.isArray(value) ? value : [value])
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('customer', 'Customer')}>
            <ContactsRelationField
              kind="customer"
              value={values.customerId}
              scope={`${scope}.customer`}
              onValueChange={(value) => set('customerId', value)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('company', 'Company')}>
            <ContactsRelationField
              kind="company"
              value={values.companyId}
              scope={`${scope}.company`}
              onValueChange={(value) => set('companyId', value)}
            />
          </PanelFormRow>
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-xs font-medium text-accent-foreground">
              {t('description', 'Description')}
            </span>
            {ready ? (
              <BlockEditor editor={editor} className="min-h-28 read-only" />
            ) : (
              <Spinner containerClassName="py-6" />
            )}
          </div>
          <DataExtensionCreateFields
            recordType={PROJECT_CONTENT_TYPE}
            layout="stack"
            className="mt-3"
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};
