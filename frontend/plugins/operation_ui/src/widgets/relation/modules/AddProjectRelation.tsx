import { useCreateProjectRecord } from '@/project/hooks/useCreateProjectRecord';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { PROJECT_CONNECTION_CONTENT_TYPE } from '../../contact/projectContactConnection';

export const AddProjectRelation = ({
  showLabel = false,
  contacts,
}: {
  showLabel?: boolean;
  contacts?: { customerId?: string; companyId?: string };
}) => {
  const { t } = useTranslation('operation');
  const { openProjectDraft } = useCreateProjectRecord();
  const { openNewRecord } = useSidePanel();
  const canConnect = Boolean(contacts?.customerId || contacts?.companyId);
  const label = canConnect
    ? t('connect-project', 'Connect project')
    : t('add-project', 'Add project');

  return (
    <Button
      size={showLabel ? 'default' : 'sm'}
      variant={showLabel ? 'default' : 'ghost'}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        if (canConnect) {
          openNewRecord(PROJECT_CONNECTION_CONTENT_TYPE, contacts, {
            stack: true,
          });
        } else {
          openProjectDraft(contacts, { stack: true });
        }
      }}
    >
      <IconPlus className="size-4" />
      {showLabel && label}
    </Button>
  );
};
