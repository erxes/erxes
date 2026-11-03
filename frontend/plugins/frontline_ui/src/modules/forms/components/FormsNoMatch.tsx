import { IconFilterOff, IconForms } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const FormsNoMatch = ({ onClear }: { onClear: () => void }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });

  return (
    <Empty className="bg-sidebar rounded-lg m-3">
      <Empty.Header>
        <Empty.Media>
          <IconForms />
        </Empty.Media>
        <Empty.Title>
          {t('forms-no-match', 'No forms match your filters')}
        </Empty.Title>
        <Empty.Description>
          {t(
            'forms-no-match-description',
            'Try a different search or clear the filters.',
          )}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" onClick={onClear}>
          <IconFilterOff />
          {t('clear-filters', 'Clear filters')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};
