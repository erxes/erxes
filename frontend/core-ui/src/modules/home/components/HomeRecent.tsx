import {
  HomeEmpty,
  HomeItemMark,
  HomeItemTime,
  HomeList,
  HomeListItem,
  HomePage,
} from '@/home/components/HomeList';
import { useRecentPages } from '@/navigation/hooks/useRecentPages';
import { useTranslation } from 'react-i18next';

export const HomeRecent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const recent = useRecentPages();

  return (
    <HomePage title={t('recent')} description={t('recent-description')}>
      {recent.length === 0 ? (
        <HomeEmpty>{t('recent-empty')}</HomeEmpty>
      ) : (
        <HomeList>
          {recent.map((page) => (
            <HomeListItem
              key={page.to}
              to={page.to}
              leading={<HomeItemMark app={page.activity} />}
              title={page.label}
              subtitle={page.activity.label}
              trailing={<HomeItemTime date={page.visitedAt} />}
            />
          ))}
        </HomeList>
      )}
    </HomePage>
  );
};
