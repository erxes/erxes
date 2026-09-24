import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { articlesTotalCountAtom } from '@/knowledgebase/articles/states/articlesTotalCountState';

export const ArticlesTotalCount = () => {
  const { t } = useTranslation('frontline');
  const totalCount = useAtomValue(articlesTotalCountAtom);

  return (
    <div className="text-sm font-medium leading-7 h-7 whitespace-nowrap text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="inline-block mt-1.5 w-20 h-4" />
      ) : (
        t('records-found', { count: totalCount })
      )}
    </div>
  );
};
