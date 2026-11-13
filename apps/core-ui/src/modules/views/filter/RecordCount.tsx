import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { formatTotal } from '~/lib/cursorList';

/** How many records the list shows, quietly, at the start of its filter. */
export const RecordCount = ({
  totalCount,
  totalCapped,
}: {
  totalCount: number | null | undefined;
  totalCapped?: boolean;
}) => {
  const { t } = useTranslation('views');

  if (isUndefinedOrNull(totalCount)) return <Skeleton className="mx-1.5 h-3.5 w-14" />;

  return (
    <span className="shrink-0 whitespace-nowrap px-1.5 text-xs tabular-nums text-muted-foreground">
      {t('count', {
        count: totalCapped ? 2 : totalCount,
        formatted: formatTotal(totalCount, totalCapped),
      })}
    </span>
  );
};
