import {
  HomeEmpty,
  HomeItemMark,
  HomeList,
  HomeListItem,
  HomePage,
} from '@/home/components/HomeList';
import { useStarredPages } from '@/navigation/hooks/useStarredPages';
import { useTranslation } from 'react-i18next';

export const HomeStarred = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const starred = useStarredPages();

  return (
    <HomePage title={t('starred')} description={t('starred-description')}>
      {starred.length === 0 ? (
        <HomeEmpty>{t('starred-empty')}</HomeEmpty>
      ) : (
        <HomeList>
          {starred.map((page) => (
            <HomeListItem
              key={page.to}
              to={page.to}
              leading={<HomeItemMark app={page.app} icon={page.icon} />}
              title={page.title}
              subtitle={page.app?.label ?? page.section}
            />
          ))}
        </HomeList>
      )}
    </HomePage>
  );
};
