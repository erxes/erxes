import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CycleStatusDisplay = ({
  isActive,
  isCompleted,
}: {
  isActive: boolean;
  isCompleted: boolean;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Badge variant={isActive ? 'success' : isCompleted ? 'info' : 'secondary'}>
      {isActive ? t('active') : isCompleted ? t('completed') : t('upcoming')}
    </Badge>
  );
};
