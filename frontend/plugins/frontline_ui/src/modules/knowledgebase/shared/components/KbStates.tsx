import { IconAlertCircle, type Icon } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const KbEmptyState = ({
  icon: EmptyIcon,
  title,
  description,
  action,
}: {
  icon: Icon;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}) => (
  <Empty className="m-3 rounded-lg bg-sidebar">
    <Empty.Header>
      <Empty.Media variant="icon">
        <EmptyIcon />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
    {action ? <Empty.Content>{action}</Empty.Content> : null}
  </Empty>
);

export const KbErrorState = ({ message }: { message: string }) => {
  const { t } = useTranslation('frontline');

  return (
    <KbEmptyState
      icon={IconAlertCircle}
      title={t('error')}
      description={message}
    />
  );
};
