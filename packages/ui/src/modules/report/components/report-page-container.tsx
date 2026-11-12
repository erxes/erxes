import {
  IconChevronDown,
  IconFileSpreadsheet,
  IconMinus,
  IconPercentage,
  IconPlus,
  IconPrinter,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';
import type { ReactNode } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';
import { Popover } from 'erxes-ui/components/popover';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { Separator } from 'erxes-ui/components/separator';
import { Toggle } from 'erxes-ui/components/toggle';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';
import { PageContainer } from 'erxes-ui/modules/layout/components/Page';
import { printSettingsAtom } from '../states/reportSettingsState';

const MIN_PRINT_SIZE = 60;
const MAX_PRINT_SIZE = 160;

/** 100% prints at 12px; every 10% step changes the size by 1px. */
const printSizeToFontSize = (size: number) => `${12 - (100 - size) / 10}px`;

const PrintSizeControl = () => {
  const [{ printsize }, setPrintSettings] = useAtom(printSettingsAtom);

  const changeSize = (size: number) => {
    if (size < MIN_PRINT_SIZE || size > MAX_PRINT_SIZE) return;

    setPrintSettings((prev) => ({ ...prev, printsize: size }));
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="icon"
        className="bg-border"
        aria-label="Smaller print"
        onClick={() => changeSize(printsize - 10)}
      >
        <IconMinus />
      </Button>
      <div className="relative">
        <Input
          className="w-20 pr-8 text-center"
          value={printsize}
          readOnly
          aria-label="Print size in percent"
        />
        <IconPercentage className="absolute right-2 top-1.5 size-4 text-muted-foreground" />
      </div>
      <Button
        variant="secondary"
        size="icon"
        className="bg-border"
        aria-label="Larger print"
        onClick={() => changeSize(printsize + 10)}
      >
        <IconPlus />
      </Button>
    </div>
  );
};

const PrintSettings = () => {
  const [{ showTableLayoutOnEveryPage }, setPrintSettings] = useAtom(printSettingsAtom);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" className="rounded-l-none" aria-label="Print settings">
          <IconChevronDown />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Label variant="peer" className="font-medium">
          Print settings
        </Label>
        <div className="flex flex-col gap-2 pt-4 pb-2">
          <Label>Table</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-table-header-on-every-page"
              checked={showTableLayoutOnEveryPage}
              onCheckedChange={(value) =>
                setPrintSettings((prev) => ({ ...prev, showTableLayoutOnEveryPage: !!value }))
              }
            />
            <Label variant="peer" htmlFor="show-table-header-on-every-page">
              Show table layout on every page
            </Label>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};

/** A printable report page: preview toggle, print size and print settings above the report. */
export const ReportPageContainer = ({ children }: { children: ReactNode }) => {
  // The preview is on until the member turns it off.
  const [inPreviewParam, setInPreview] = useQueryState<boolean>('inPreview');
  const inPreview = inPreviewParam ?? true;
  const [{ printsize }] = useAtom(printSettingsAtom);

  return (
    <PageContainer className="h-dvh print:h-auto print:block">
      <header className="flex items-center justify-between h-10 px-3 box-border shrink-0 bg-sidebar overflow-auto styled-scroll print:hidden">
        <div className="flex items-center gap-2 flex-none pr-8">
          <Button variant="ghost">Report</Button>
          <Separator.Inline />
          <Toggle pressed={inPreview} onPressedChange={setInPreview}>
            {inPreview ? 'hide sidebar' : 'show sidebar'}
          </Toggle>
        </div>
        <PrintSizeControl />
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <IconFileSpreadsheet />
            Export to excel
          </Button>
          <div className="inline-flex rounded shadow-sm">
            <Button onClick={() => window.print()} variant="ghost" className="rounded-r-none">
              <IconPrinter />
              Print
            </Button>
            <Separator orientation="vertical" className="h-7" />
            <PrintSettings />
          </div>
        </div>
      </header>
      <Separator />
      <ReportStyle />
      <ScrollArea className="bg-sidebar flex-auto">
        <div
          className="m-4 bg-background shadow-sm mx-auto max-w-5xl pl-15 p-8 print:shadow-none"
          style={{ fontSize: printSizeToFontSize(printsize) }}
        >
          {children}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

const REPORT_PRINT_CSS = `
@page { margin: 0; margin-top: 5mm; background: white; }
table { page-break-after: auto; }
table tr { page-break-inside: avoid; page-break-after: auto; }
table td { page-break-inside: avoid; page-break-after: auto; }
`;

export const ReportStyle = () => <style>{REPORT_PRINT_CSS}</style>;
