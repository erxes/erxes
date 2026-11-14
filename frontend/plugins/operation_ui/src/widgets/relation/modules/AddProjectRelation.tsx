import { useCreateProjectRecord } from '@/project/hooks/useCreateProjectRecord';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AddProjectRelation = ({
  label,
  contacts,
}: {
  label?: string;
  contacts?: { customerId?: string; companyId?: string };
}) => {
  const { t } = useTranslation('operation');
  const { openProjectDraft } = useCreateProjectRecord();

  return (
    <Button
      size={label ? 'default' : 'sm'}
      variant={label ? 'default' : 'ghost'}
      aria-label={t('add-project')}
      onClick={(event) => {
        event.stopPropagation();
        openProjectDraft(contacts, { stack: true });
      }}
    >
      <IconPlus className="size-4" />
      {label}
    </Button>
  );
};
