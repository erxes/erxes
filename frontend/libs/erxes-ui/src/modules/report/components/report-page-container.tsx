import {
  IconChevronDown,
  IconFileSpreadsheet,
  IconMinus,
  IconPercentage,
  IconPlus,
  IconPrinter,
} from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  ScrollArea,
  Separator,
  Toggle,
} from 'erxes-ui/components';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';
import { PageContainer } from 'erxes-ui/modules/layout';
import { printSettingsAtom } from '../states/reportSettingsState';

export const ReportPageContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [inPreview, setInPreview] = useQueryState<boolean>('inPreview');
  const [{ printsize, showTableLayoutOnEveryPage }, setPrintSettings] =
    useAtom(printSettingsAtom);
  useEffect(() => {
    if (!inPreview) {
      setInPreview(true);
    }
  }, []);

  const printsizeToFontSize = (size: number) => {
    const margin = (100 - size) / 10;

    return `${12 - margin}px`;
  };

  const handlePrintsizeChange = (size: number) => {
    if (size < 60) {
      return;
    }

    if (size > 160) {
      return;
    }

    setPrintSettings((prev) => ({ ...prev, printsize: size }));
  };

  return (
    <PageContainer className="h-dvh print:h-auto print:block">
      <header className="flex items-center justify-between h-13 px-3 box-border shrink-0 bg-sidebar overflow-auto styled-scroll print:hidden">
        <div className="flex items-center gap-2 flex-none pr-8">
          <Button variant="ghost">Report</Button>
          <Separator.Inline />
          <Toggle pressed={!!inPreview} onPressedChange={setInPreview}>
            {inPreview ? 'hide sidebar' : 'show sidebar'}
          </Toggle>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="bg-border"
            onClick={() => handlePrintsizeChange(printsize - 10)}
          >
            <IconMinus />
          </Button>
          <div className="relative">
            <Input className="w-20 pr-8 text-center" value={printsize} />
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0.5 top-0.5 hover:bg-muted"
            >
              <IconPercentage />
            </Button>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="bg-border"
            onClick={() => handlePrintsizeChange(printsize + 10)}
          >
            <IconPlus />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <IconFileSpreadsheet />
            Export to excel
          </Button>
          <div className="inline-flex rounded shadow-sm">
            <Button
              onClick={() => window.print()}
              variant="ghost"
              className="rounded-r-none"
            >
              <IconPrinter />
              Print
            </Button>
            <Separator orientation="vertical" className="h-7" />
            <Popover>
              <Popover.Trigger asChild>
                <Button variant="ghost" size="icon" className="rounded-l-none">
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
                        setPrintSettings((prev) => ({
                          ...prev,
                          showTableLayoutOnEveryPage: !!value,
                        }))
                      }
                    />
                    <Label
                      variant="peer"
                      htmlFor="show-table-header-on-every-page"
                    >
                      Show table layout on every page
                    </Label>
                  </div>
                </div>
              </Popover.Content>
            </Popover>
          </div>
        </div>
      </header>
      <Separator />
      <ReportStyle />
      <ScrollArea className="bg-sidebar flex-auto">
        <div
          className="m-4 bg-background shadow-sm mx-auto max-w-5xl pl-15 p-8 print:shadow-none"
          style={{ fontSize: printsizeToFontSize(printsize) }}
        >
          {children}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

export const ReportStyle = () => {
  return (
    <style>
      {`
        @page {
          margin: 0;
          background: white;
          margin-top: 5mm; 
        }
  
        
        table { page-break-after: auto; }
        table tr { page-break-inside: avoid; page-break-after: auto; }
        table td { page-break-inside: avoid; page-break-after: auto; }
        
      `}
    </style>
  );
};
