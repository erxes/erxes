import { IDeal } from '@/deals/types/deals';
import { formatDealSearchResultDate } from '@/deals/utils/dealSearch';
import { Badge, highlightMatch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TDealSearchResultProps = {
  deal: IDeal;
  nameSearch: string;
  numberSearch: string;
  onSelect: (deal: IDeal) => void;
};

export const DealSearchResult = ({
  deal,
  nameSearch,
  numberSearch,
  onSelect,
}: TDealSearchResultProps) => {
  const { t } = useTranslation('sales');
  const hasPipeline = Boolean(
    deal.pipeline?._id && (deal.boardId || deal.pipeline.boardId),
  );

  return (
    <button
      type="button"
      disabled={!hasPipeline}
      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm hover:bg-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      onClick={() => onSelect(deal)}
    >
      <span className="min-w-0 truncate font-medium">
        {highlightMatch(
          deal.name || t('unnamed-deal', 'Unnamed deal'),
          nameSearch,
        )}
      </span>
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {deal.number ? <>#{highlightMatch(deal.number, numberSearch)}</> : '—'}
      </span>
      <span className="flex min-w-0 items-center gap-2 truncate text-xs text-muted-foreground">
        {deal.pipeline?.name || t('no-pipeline')}
        {deal.status === 'archived' && (
          <Badge
            variant="secondary"
            className="h-4 border-yellow-200 bg-yellow-100 py-0 text-[11px] text-yellow-800"
          >
            {t('archived')}
          </Badge>
        )}
      </span>
      <time
        className="whitespace-nowrap text-xs text-muted-foreground"
        dateTime={deal.createdAt?.toString()}
      >
        {deal.createdAt ? formatDealSearchResultDate(deal.createdAt) : '—'}
      </time>
    </button>
  );
};
