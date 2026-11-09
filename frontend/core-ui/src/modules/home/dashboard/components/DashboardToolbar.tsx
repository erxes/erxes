import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import { IconLayoutDashboard, IconRestore } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DashboardToolbar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const {
    loading,
    saving,
    isEditing,
    isCustomized,
    startEditing,
    cancelEditing,
    finishEditing,
    resetLayout,
  } = useDashboard();

  if (!isEditing) {
    return (
      // Narrow screens stack the tiles, so there is nothing to arrange there
      <Button
        variant="secondary"
        className="hidden md:inline-flex"
        disabled={loading}
        onClick={startEditing}
      >
        <IconLayoutDashboard />
        {t('customize')}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isCustomized && (
        <Button variant="ghost" disabled={saving} onClick={resetLayout}>
          <IconRestore />
          {t('reset')}
        </Button>
      )}
      <Button variant="ghost" disabled={saving} onClick={cancelEditing}>
        {t('cancel')}
      </Button>
      <Button disabled={saving} onClick={() => finishEditing()}>
        {saving && <Spinner size="sm" />}
        {t('done')}
      </Button>
    </div>
  );
};
