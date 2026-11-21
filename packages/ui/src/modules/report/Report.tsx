import type { ComponentProps } from 'react';
import { onDemand } from 'erxes-ui/components/on-demand';
import { cn } from 'erxes-ui/lib/utils';

/**
 * A printable report page: a toolbar to zoom and print, then the sheet.
 * The toolbar also shows or hides the plugin's sidebar. The sheet's text follows the print
 * size, which `ReportTable` scales with. `?inPreview` in the address says whether the plugin
 * shows its sidebar; it starts on. Export to Excel shows with `onExport`. Its code loads on
 * first use.
 */
export const ReportPageContainer = onDemand(
  async () => (await import('./ReportPage')).ReportPageContainer,
);

// The report's table: its sizes are in em, so it grows and shrinks with the print size.

const ReportTableRoot = ({ className, ...props }: ComponentProps<'table'>) => (
  <table className={cn('w-full caption-bottom overflow-hidden', className)} {...props} />
);

const ReportTableHeader = ({ className, ...props }: ComponentProps<'thead'>) => (
  <thead className={cn('[&_tr]:border', className)} {...props} />
);

const ReportTableBody = ({ className, ...props }: ComponentProps<'tbody'>) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

const ReportTableFooter = ({ className, ...props }: ComponentProps<'tfoot'>) => (
  <tfoot className={cn('border-t font-medium [&>tr]:last:border-b-0', className)} {...props} />
);

const ReportTableRow = ({ className, ...props }: ComponentProps<'tr'>) => (
  <tr
    className={cn('border transition-colors hover:bg-muted/50 data-selected:bg-muted', className)}
    {...props}
  />
);

const ReportTableHead = ({ className, ...props }: ComponentProps<'th'>) => (
  <th
    className={cn('report-head border align-middle font-medium text-foreground', className)}
    {...props}
  />
);

const ReportTableCell = ({ className, ...props }: ComponentProps<'td'>) => (
  <td
    className={cn('report-cell border align-middle break-all whitespace-normal', className)}
    {...props}
  />
);

const ReportTableCaption = ({ className, ...props }: ComponentProps<'caption'>) => (
  <caption className={cn('report-caption text-muted-foreground', className)} {...props} />
);

/**
 * A printable report's table, bordered, sized in em.
 * Put it in a `ReportPageContainer`, which scales it with the page's print size.
 */
export const ReportTable = Object.assign(ReportTableRoot, {
  Header: ReportTableHeader,
  Body: ReportTableBody,
  Footer: ReportTableFooter,
  Head: ReportTableHead,
  Row: ReportTableRow,
  Cell: ReportTableCell,
  Caption: ReportTableCaption,
});
