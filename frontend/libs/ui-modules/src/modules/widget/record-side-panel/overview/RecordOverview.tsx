import { IconChevronRight } from '@tabler/icons-react';
import { Button, cn, ScrollArea } from 'erxes-ui';
import { useAtom } from 'jotai';
import { Fragment, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { IRelationWidgetTab } from 'ui-modules/modules/widget/record-side-panel/useRelationWidgetTabs';
import { RecordOverviewCustomize } from 'ui-modules/modules/widget/record-side-panel/overview/RecordOverviewCustomize';
import type { IRecordOverviewSection } from 'ui-modules/modules/widget/record-side-panel/overview/recordOverviewEntries';
import { recordOverviewFoldedState } from 'ui-modules/modules/widget/record-side-panel/overview/recordOverviewState';
import type { IRecordOverview } from 'ui-modules/modules/widget/record-side-panel/overview/useRecordOverview';

export interface IRecordOverviewSectionSlot {
  sectionKey: string;
  section: IRecordOverviewSection;
  folded: boolean;
  onFold: (key: string, folded: boolean) => void;
}

const RecordOverviewWidgetSection = ({
  tab,
  folded,
  onFold,
}: {
  tab: IRelationWidgetTab;
  folded: boolean;
  onFold: (folded: boolean) => void;
}) => (
  <section className="border-b last:border-b-0 py-1">
    <div className="flex items-center h-8 px-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-1.5 text-xs font-medium"
        aria-expanded={!folded}
        onClick={() => onFold(!folded)}
      >
        <IconChevronRight
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            !folded && 'rotate-90',
          )}
        />
        <tab.icon className="size-4 text-muted-foreground" />
        {tab.label}
      </Button>
    </div>
    {!folded && (
      <div className="mx-1.5 mb-1 flex h-80 flex-col overflow-hidden rounded-sm border">
        {tab.content}
      </div>
    )}
  </section>
);

export const RecordOverview = ({
  overview,
  renderSection,
}: {
  overview: IRecordOverview;
  renderSection?: (slot: IRecordOverviewSectionSlot) => ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [foldedMap, setFoldedMap] = useAtom(recordOverviewFoldedState);
  const { contentType, allEntries, overviewEntries, layout } = overview;

  const isFolded = (key: string, byDefault: boolean) =>
    foldedMap[`${contentType}:${key}`] ?? byDefault;

  const setFolded = useCallback(
    (key: string, folded: boolean) =>
      setFoldedMap((previous) => ({
        ...previous,
        [`${contentType}:${key}`]: folded,
      })),
    [contentType, setFoldedMap],
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      {allEntries.length > 0 && (
        <div className="flex h-9 flex-none items-center justify-between gap-2 border-b px-3">
          <h2 className="min-w-0 truncate text-xs font-medium text-muted-foreground">
            {t('related-records', 'Related records')}
          </h2>
          <RecordOverviewCustomize
            entries={allEntries}
            tabs={layout.tabs}
            onReorder={overview.onReorder}
            onToggleTab={overview.onToggleTab}
          />
        </div>
      )}
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        {overviewEntries.map((entry) =>
          entry.kind === 'section' ? (
            <Fragment key={entry.key}>
              {renderSection?.({
                sectionKey: entry.key,
                section: entry.section,
                folded: isFolded(entry.key, false),
                onFold: setFolded,
              })}
            </Fragment>
          ) : (
            <RecordOverviewWidgetSection
              key={entry.key}
              tab={entry.tab}
              folded={isFolded(entry.key, true)}
              onFold={(folded) => setFolded(entry.key, folded)}
            />
          ),
        )}
      </ScrollArea>
    </div>
  );
};
