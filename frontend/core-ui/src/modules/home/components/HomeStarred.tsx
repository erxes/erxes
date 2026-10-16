import {
  HomeEmpty,
  HomeItemMark,
  HomeList,
  HomeListItem,
  HomePage,
} from '@/home/components/HomeList';
import { useStarredPages } from '@/navigation/hooks/useStarredPages';

export const HomeStarred = () => {
  const starred = useStarredPages();

  return (
    <HomePage title="Starred" description="Pages you starred in any plugin">
      {starred.length === 0 ? (
        <HomeEmpty>Pages you star show up here.</HomeEmpty>
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
