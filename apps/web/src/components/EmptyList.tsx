import { IconInbox } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Under an empty list's header: nothing here (yet, or for these filters). */
export const EmptyList = () => {
  const { t } = useTranslation('common');

  return (
    <Empty className="pointer-events-none absolute inset-x-0 top-2/5">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconInbox />
        </Empty.Media>
        <Empty.Title>{t('empty-list', 'Nothing here')}</Empty.Title>
        <Empty.Description>
          {t('empty-list-hint', 'Add one, or change the filters and search.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
