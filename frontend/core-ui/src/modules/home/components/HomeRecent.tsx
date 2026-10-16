import {
  HomeEmpty,
  HomeItemMark,
  HomeItemTime,
  HomeList,
  HomeListItem,
  HomePage,
} from '@/home/components/HomeList';
import { useRecentPages } from '@/navigation/hooks/useRecentPages';

export const HomeRecent = () => {
  const recent = useRecentPages();

  return (
    <HomePage
      title="Recent"
      description="Pages you opened in any plugin, newest first"
    >
      {recent.length === 0 ? (
        <HomeEmpty>Pages you open in any plugin show up here.</HomeEmpty>
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
