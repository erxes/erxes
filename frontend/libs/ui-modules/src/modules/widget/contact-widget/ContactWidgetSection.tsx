import { Icon, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { Button, cn, Skeleton } from 'erxes-ui';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContactOverviewSection } from './ContactOverviewContext';

// Rows shown before "Show all".
const PREVIEW_COUNT = 5;

/**
 * One module's records on a customer or company overview: a header with the
 * count (click to fold) and "+" to create one already linked, then the first
 * rows and "Show all". Plugins draw these from their `./contactWidget`; in
 * an overview its folded state is kept by the overview.
 */
export const ContactWidgetSection = ({
  icon: SectionIcon,
  label,
  ids,
  loading,
  renderItem,
  onCreate,
  createLabel,
  emptyText,
  children,
}: {
  icon: Icon;
  label: string;
  ids: string[];
  loading?: boolean;
  renderItem: (id: string) => React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
  emptyText?: string;
  // Things the section's actions open, e.g. a create sheet.
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const overview = useContactOverviewSection();
  const [ownFolded, setOwnFolded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const folded = overview ? overview.folded : ownFolded;
  const setFolded = overview ? overview.setFolded : setOwnFolded;
  const shown = showAll ? ids : ids.slice(0, PREVIEW_COUNT);

  return (
    <section className="border-b last:border-b-0 py-1">
      <div className="flex items-center gap-1 h-8 px-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-1.5 text-xs font-medium"
          aria-expanded={!folded}
          onClick={() => setFolded(!folded)}
        >
          <IconChevronRight
            className={cn(
              'size-3.5 text-muted-foreground transition-transform',
              !folded && 'rotate-90',
            )}
          />
          <SectionIcon className="size-4 text-muted-foreground" />
          {label}
          <span className="text-muted-foreground">
            {loading ? '…' : ids.length}
          </span>
        </Button>
        {onCreate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto size-7"
            aria-label={createLabel || label}
            title={createLabel || label}
            onClick={onCreate}
          >
            <IconPlus className="size-4" />
          </Button>
        )}
      </div>
      {!folded && (
        <div className="flex flex-col px-1.5 pb-1">
          {loading && (
            <div className="flex flex-col gap-1 px-1.5 py-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          )}
          {!loading && !ids.length && (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              {emptyText || t('nothing-linked', 'Nothing linked yet')}
            </p>
          )}
          {!loading &&
            shown.map((id) => <Fragment key={id}>{renderItem(id)}</Fragment>)}
          {!loading && ids.length > PREVIEW_COUNT && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 justify-start px-2 text-xs font-normal text-muted-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? t('show-less', 'Show less')
                : t('show-all', 'Show all {{count}}', { count: ids.length })}
            </Button>
          )}
        </div>
      )}
      {children}
    </section>
  );
};
