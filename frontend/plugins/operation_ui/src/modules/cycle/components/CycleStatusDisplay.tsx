import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CycleStatusDisplay = ({
  isActive,
  isCompleted,
}: {
  isActive: boolean | null;
  isCompleted: boolean | null;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Badge variant={isActive ? 'success' : isCompleted ? 'info' : 'secondary'}>
      {isActive ? t('active') : isCompleted ? t('completed') : t('upcoming')}
    </Badge>
  );
};
