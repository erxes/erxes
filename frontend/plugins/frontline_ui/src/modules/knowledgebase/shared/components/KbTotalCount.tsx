import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { Atom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export const KbTotalCount = ({
  countAtom,
}: {
  countAtom: Atom<number | null | undefined>;
}) => {
  const { t } = useTranslation('frontline');
  const totalCount = useAtomValue(countAtom);

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
