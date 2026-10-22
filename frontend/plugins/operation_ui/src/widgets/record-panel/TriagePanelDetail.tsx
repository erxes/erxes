import { SelectPriority } from '@/operation/components/SelectPriority';
import { TeamInline } from '@/team/components/TeamInline';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { ScrollArea, Spinner, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
} from 'ui-modules';
import { RecordContactsField } from './RecordContactsField';

const SCOPE = 'side-panel-triage';

// A triage's fields as record table cells: click a value to edit it. It is
// accepted as a task (or declined) from the panel's top bar.
export const TriagePanelDetail = ({ triageId }: { triageId: string }) => {
  const { t } = useTranslation('operation');
  const { triage, loading } = useGetTriage(triageId);
  const { updateTriage } = useUpdateTriage();

  if (loading && !triage) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!triage) {
    return null;
  }

  const { _id, name, priority, teamId, description } = triage;
  const update = (input: {
    name?: string;
    priority?: number;
    description?: string;
    customerId?: string | null;
    companyId?: string | null;
  }) =>
    updateTriage({
      variables: { _id, input },
      // Contacts' triage lists change with them.
      update: (cache) => {
        if (input.customerId !== undefined || input.companyId !== undefined) {
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'operationGetTriageList' });
        }
      },
    });

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-0.5 p-3">
        <PanelField label={t('name', 'Name')}>
          <TextField
            scope={`${SCOPE}.name`}
            value={name || ''}
            placeholder={t('triage-name')}
            className={PANEL_TEXT_FIELD_CLASS_NAME}
            onSave={(next) => update({ name: next })}
          />
        </PanelField>
        <PanelField label={t('priority')}>
          <SelectPriority
            variant="table"
            scope={`${SCOPE}.priority`}
            value={priority}
            onValueChange={(next) => update({ priority: next })}
          />
        </PanelField>
        <PanelField label={t('team')} cell={false}>
          <TeamInline teamId={teamId} className="h-7 px-2 font-normal" />
        </PanelField>
        <PanelField label={t('customers', 'Customers')}>
          <RecordContactsField
            kind="customer"
            value={triage.customerId}
            scope={`${SCOPE}.customer`}
            onValueChange={(customerId) => update({ customerId })}
          />
        </PanelField>
        <PanelField label={t('companies', 'Companies')}>
          <RecordContactsField
            kind="company"
            value={triage.companyId}
            scope={`${SCOPE}.company`}
            onValueChange={(companyId) => update({ companyId })}
          />
        </PanelField>
        <PanelDescriptionField
          key={_id}
          label={t('description', 'Description')}
          value={description || ''}
          scope={`${SCOPE}.description`}
          onSave={(next) => update({ description: next })}
        />
      </div>
    </ScrollArea>
  );
};
