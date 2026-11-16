import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../../components/skeleton';
import { useFormat } from '../../../lib/format';
import { isUndefinedOrNull } from '../../../utils/IsUndefinedOrNull';

/** How many records a list matches, as its list hook gives them. */
export interface Total {
  totalCount?: number | null;
  totalCapped?: boolean;
}

/** The list's count, quietly, after its filter; hidden on narrow screens. */
export const RecordCount = ({ totalCount, totalCapped }: Total) => {
  const { t } = useTranslation('views');
  const fmt = useFormat();

  if (isUndefinedOrNull(totalCount)) return <Skeleton className="hidden h-3.5 w-14 md:block" />;

  return (
    <span className="hidden shrink-0 whitespace-nowrap px-1 text-xs tabular-nums text-muted-foreground md:inline">
      {t('count', {
        count: totalCapped ? 2 : totalCount,
        formatted: fmt.count(totalCount, totalCapped),
        defaultValue_one: '{{formatted}} record',
        defaultValue_other: '{{formatted}} records',
      })}
    </span>
  );
};
