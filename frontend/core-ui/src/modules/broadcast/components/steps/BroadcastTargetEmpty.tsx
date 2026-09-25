import { TablerIcon } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

/**
 * Nothing to aim the campaign at yet. Says so, and goes to where the first
 * one is made rather than leaving an empty list to puzzle over.
 */
export const BroadcastTargetEmpty = ({
  icon: Icon,
  titleKey,
  descriptionKey,
  actionKey,
  to,
}: {
  icon: TablerIcon;
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
  to: string;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <Icon />
        </Empty.Media>
        <Empty.Title>{t(titleKey)}</Empty.Title>
        <Empty.Description>{t(descriptionKey)}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" asChild>
          <Link to={to}>{t(actionKey)}</Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};
