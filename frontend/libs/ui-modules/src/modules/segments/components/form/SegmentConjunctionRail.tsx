import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SegmentConjunctionRail = ({
  conjunction,
  onToggle,
}: {
  conjunction: 'and' | 'or';
  onToggle: () => void;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const isAnd = conjunction === 'and';

  return (
    <div className="w-9 shrink-0 relative flex items-center justify-center">
      {/* Drawn behind the badge and only across the right half of the gutter,
          so the badge sits on the bracket rather than beside it. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-1 left-1/2 right-1 rounded-l-md border-y border-l',
          isAnd ? 'border-green-300' : 'border-amber-300',
        )}
      />
      <button
        type="button"
        onClick={onToggle}
        title={isAnd ? t('all-conditions-match') : t('any-condition-matches')}
        className={cn(
          'relative w-10 h-6 rounded-full text-xs font-medium uppercase',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isAnd
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        )}
      >
        {isAnd ? t('and') : t('or')}
      </button>
    </div>
  );
};
