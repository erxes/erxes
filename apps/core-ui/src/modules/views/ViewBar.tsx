import type { ViewRecordType } from '@erxes/core-contract';
import { IconRotate } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SaveViewButton } from './ViewControls';
import { ViewTabs } from './ViewTabs';
import { useViewState } from './useViews';

/**
 * A list's one bar: its saved views as tabs, then its filter (the menu, the
 * chips, toggles, the count). While the list differs from the open view:
 * Reset and Save.
 */
export const ViewBar = ({
  recordType,
  allLabel,
  children,
}: {
  recordType: ViewRecordType;
  allLabel: string;
  /** The list's filter bar. */
  children: ReactNode;
}) => {
  const { t } = useTranslation('views');
  const { current, changed, query } = useViewState(recordType);

  return (
    <div className="flex min-h-10 shrink-0 items-center gap-1 border-b bg-background px-3 py-0.5">
      <div className="flex min-w-0 max-w-[55%] shrink-0 items-center gap-1 overflow-x-auto">
        <ViewTabs recordType={recordType} allLabel={allLabel} />
      </div>
      <div aria-hidden className="mx-1.5 h-5 w-px shrink-0 bg-border" />
      <div className="flex min-w-0 flex-1 items-center">{children}</div>
      {changed && (
        <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">
          <span className="mr-1 hidden text-xs text-muted-foreground md:inline">
            {current ? t('edited') : t('filtered')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-muted-foreground"
            onClick={() => query.openView(current)}
          >
            <IconRotate className="size-3.5" />
            {t('reset')}
          </Button>
          <SaveViewButton recordType={recordType} />
        </div>
      )}
    </div>
  );
};
