import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { useCreateTriageRecord } from '@/triage/hooks/useCreateTriageRecord';
import { IconPlus } from '@tabler/icons-react';
import { Button, useScopedHotkeys } from 'erxes-ui';
import { TRelationEntity } from 'ui-modules';
import { useTranslation } from 'react-i18next';

/**
 * Opens a new triage as a draft in the side panel; it is created once
 * named. There is no add-triage form. Not shown while no team of the user
 * has triage on.
 */
export const AddTriageButton = ({
  contacts,
  host,
  iconOnly,
}: {
  // Linked to the triage by its create mutation.
  contacts?: { customerId?: string; companyId?: string };
  // A record (not a contact) the triage is created from and linked to.
  host?: TRelationEntity;
  iconOnly?: boolean;
}) => {
  const { t } = useTranslation('operation');
  const { openTriageDraft, canCreate } = useCreateTriageRecord();
  const fromRecord = !!contacts || !!host;
  const create = () =>
    openTriageDraft({ ...contacts, host }, { stack: fromRecord });

  useScopedHotkeys(
    'c',
    () => canCreate && create(),
    TaskHotKeyScope.TasksPage,
  );

  if (!canCreate) {
    return null;
  }

  if (iconOnly) {
    return (
      <Button
        size="sm"
        variant="ghost"
        aria-label={t('add-triage')}
        onClick={create}
      >
        <IconPlus className="size-4" />
      </Button>
    );
  }

  return (
    <Button onClick={create}>
      <IconPlus />
      {t('add-triage')}
    </Button>
  );
};
