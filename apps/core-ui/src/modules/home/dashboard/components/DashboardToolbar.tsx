import { IconLayoutDashboard, IconRestore } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../context/DashboardProvider';

export const DashboardToolbar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const { isEditing, isCustomized, startEditing, cancelEditing, finishEditing, resetLayout } =
    useDashboard();

  if (!isEditing) {
    return (
      // Narrow screens stack the tiles, so there is nothing to arrange there
      <Button variant="secondary" className="hidden md:inline-flex" onClick={startEditing}>
        <IconLayoutDashboard />
        {t('customize')}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isCustomized && (
        <Button variant="ghost" onClick={resetLayout}>
          <IconRestore />
          {t('reset')}
        </Button>
      )}
      <Button variant="ghost" onClick={cancelEditing}>
        {t('cancel')}
      </Button>
      <Button onClick={finishEditing}>{t('done')}</Button>
    </div>
  );
};
