import { HomeApps } from '@/home/components/HomeApps';
import { HomeGreeting } from '@/home/components/HomeGreeting';
import { HomeNotifications } from '@/home/components/HomeNotifications';
import { HomeStarred } from '@/home/components/HomeStarred';
import { useTranslation } from 'react-i18next';

export const HomePage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  return (
    <div className="styled-scroll h-full overflow-y-auto bg-muted/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <HomeGreeting />
        <div className="grid gap-6 lg:grid-cols-2">
          <HomeNotifications />
          <HomeStarred />
        </div>
        <HomeApps
          kind="plugin"
          title={t('installed-plugins')}
          emptyLabel={t('plugins-empty')}
        />
        <HomeApps
          kind="core"
          title={t('core-modules')}
          emptyLabel={t('core-modules-empty')}
        />
      </div>
    </div>
  );
};
