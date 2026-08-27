import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * The gutter down the left of a group's children, carrying its and / or badge.
 *
 * Laid out as a flex column rather than absolutely positioned: the column
 * stretches to whatever height the rows happen to be and centres the badge on
 * its own, so nothing has to be measured and nothing escapes its container to
 * collide with an open dropdown.
 */
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
    <div className="w-12 shrink-0 flex items-center justify-center border-r py-2">
      <button
        type="button"
        onClick={onToggle}
        title={isAnd ? t('all-conditions-match') : t('any-condition-matches')}
        className={cn(
          'translate-x-6 w-11 h-6 rounded-full text-xs font-medium uppercase',
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
