import { IconAffiliate, IconPlus } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Can } from 'ui-modules';

export const AutomationsRecordTableEmptyState = () => {
  const { t } = useTranslation('automations');

  return (
    <Empty className="m-3 min-h-[20rem] bg-accent/30">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAffiliate />
        </Empty.Media>
        <Empty.Title>{t('empty-title', 'No automations found')}</Empty.Title>
        <Empty.Description>{t('empty-description', 'Create a new automation or adjust your filters to keep moving.')}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Can action="automationsCreate">
          <Button asChild>
            <Link to="/automations/create">
              <IconPlus className="size-4" />
              {t('create', 'Create a new automation')}
            </Link>
          </Button>
        </Can>
      </Empty.Content>
    </Empty>
  );
};
