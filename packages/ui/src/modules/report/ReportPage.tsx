import {
  IconChevronDown,
  IconFileSpreadsheet,
  IconMinus,
  IconPercentage,
  IconPlus,
  IconPrinter,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from 'erxes-ui/components/button';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';
import { Popover } from 'erxes-ui/components/popover';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { Separator } from 'erxes-ui/components/separator';
import { Toggle } from 'erxes-ui/components/toggle';
import { stored } from 'erxes-ui/lib/stored';
import { PageContainer } from 'erxes-ui/modules/layout/components/Page';

/** How a member prints reports, kept in this browser. */
const printSettingsState = stored({
  key: 'erxes:ui:report-print',
  schema: z.object({ printsize: z.number(), showTableLayoutOnEveryPage: z.boolean() }),
  initial: { printsize: 100, showTableLayoutOnEveryPage: true },
});

const MIN_PRINTSIZE = 60;
const MAX_PRINTSIZE = 160;

/** 100% prints at 12px; each 10% step is a pixel. */
const fontSizeOf = (printsize: number) => `${12 - (100 - printsize) / 10}px`;

/** The print size, a step at a time, between 60% and 160%. */
const PrintSize = () => {
  const { t } = useTranslation('ui', { keyPrefix: 'report' });
  const [settings, setSettings] = useAtom(printSettingsState);

  const change = (printsize: number) => {
    if (printsize < MIN_PRINTSIZE || printsize > MAX_PRINTSIZE) return;

    setSettings({ ...settings, printsize });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="icon"
        aria-label={t('smaller', 'Smaller')}
        onClick={() => change(settings.printsize - 10)}
      >
        <IconMinus />
      </Button>
      <div className="relative">
        <Input
          readOnly
          aria-label={t('print-size', 'Print size')}
          className="w-20 pr-8 text-center"
          value={settings.printsize}
        />
        <span className="pointer-events-none absolute right-0.5 top-0.5 flex size-6 items-center justify-center text-muted-foreground [&>svg]:size-4">
          <IconPercentage />
        </span>
      </div>
      <Button
        variant="secondary"
        size="icon"
        aria-label={t('larger', 'Larger')}
        onClick={() => change(settings.printsize + 10)}
      >
        <IconPlus />
      </Button>
    </div>
  );
};

/** Print, and the print settings beside it. */
const PrintButton = () => {
  const { t } = useTranslation('ui', { keyPrefix: 'report' });
  const [settings, setSettings] = useAtom(printSettingsState);

  return (
    <div className="inline-flex rounded shadow-sm">
      <Button onClick={() => window.print()} variant="ghost">
        <IconPrinter />
        {t('print', 'Print')}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Popover>
        <Popover.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('print-settings', 'Print settings')}
            />
          }
        >
          <IconChevronDown />
        </Popover.Trigger>
        <Popover.Content>
          <span className="text-sm font-medium">{t('print-settings', 'Print settings')}</span>
          <div className="flex flex-col gap-2 pb-2 pt-4">
            <span className="text-sm font-medium">{t('table', 'Table')}</span>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-table-header-on-every-page"
                checked={settings.showTableLayoutOnEveryPage}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, showTableLayoutOnEveryPage: checked })
                }
              />
              <Label variant="peer" htmlFor="show-table-header-on-every-page">
                {t('every-page', 'Show table layout on every page')}
              </Label>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
};

/**
 * A printable report page: a toolbar to zoom and print, then the sheet.
 * The toolbar also shows or hides the plugin's sidebar. The sheet's text follows the print size, which `ReportTable` scales with. `?inPreview` in
 * the address says whether the plugin shows its sidebar; it starts on. Export to Excel shows
 * with `onExport`.
 */
export const ReportPageContainer = ({
  children,
  onExport,
}: {
  children: ReactNode;
  onExport?: () => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'report' });
  const [inPreview, setInPreview] = useQueryState('inPreview', parseAsBoolean);
  const [{ printsize }] = useAtom(printSettingsState);

  useEffect(() => {
    if (inPreview === null) void setInPreview(true);
  }, [inPreview, setInPreview]);

  return (
    <PageContainer className="h-dvh print:block print:h-auto">
      <header className="styled-scroll box-border flex h-10 shrink-0 items-center justify-between overflow-auto bg-sidebar px-3 print:hidden">
        <div className="flex flex-none items-center gap-2 pr-8">
          <span className="px-3 text-sm font-medium">{t('report', 'Report')}</span>
          <Separator.Inline />
          <Toggle pressed={Boolean(inPreview)} onPressedChange={(on) => void setInPreview(on)}>
            {inPreview ? t('hide-sidebar', 'hide sidebar') : t('show-sidebar', 'show sidebar')}
          </Toggle>
        </div>
        <PrintSize />
        <div className="flex items-center gap-3">
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <IconFileSpreadsheet />
              {t('export-excel', 'Export to excel')}
            </Button>
          )}
          <PrintButton />
        </div>
      </header>
      <Separator />
      <ScrollArea className="flex-auto bg-sidebar">
        <div
          className="m-4 [&_td]:break-inside-avoid [&_tr]:break-inside-avoid mx-auto max-w-5xl bg-background p-8 pl-15 text-(length:--report-font-size) shadow-sm print:shadow-none"
          style={{ '--report-font-size': fontSizeOf(printsize) }}
        >
          {children}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
