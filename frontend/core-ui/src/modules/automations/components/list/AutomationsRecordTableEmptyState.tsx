import { IconAffiliate, IconPlus } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

export const AutomationsRecordTableEmptyState = ({
  onCreate,
}: {
  onCreate: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Empty className="m-3 min-h-[20rem] bg-accent/30">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAffiliate />
        </Empty.Media>
        <Empty.Title>{t('empty-title')}</Empty.Title>
        <Empty.Description>{t('empty-description')}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Can action="automationsCreate">
          <Button onClick={onCreate}>
            <IconPlus className="size-4" />
            {t('create')}
          </Button>
        </Can>
      </Empty.Content>
    </Empty>
  );
};
