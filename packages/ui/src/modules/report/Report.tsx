import { type ComponentProps, Suspense, use } from 'react';
import { onDemand } from 'erxes-ui/components/on-demand';
import type * as PartsModule from './ReportTableParts';

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

// Only plugins' report pages draw report tables, so their code loads with the first one. The
// table suspends until it has; its parts render inside it, so by then use() reads the settled
// promise without suspending again, and the whole table appears at once.
let partsModule: Promise<typeof PartsModule> | undefined;

const useModule = () => {
  partsModule ??= import('./ReportTableParts');

  return use(partsModule);
};

const useParts = () => useModule().ReportTableParts;

type Parts = typeof PartsModule.ReportTableParts;

const LoadedRoot = (props: ComponentProps<Parts>) => {
  const { ReportTableRoot: Root } = useModule();

  return <Root {...props} />;
};

const ReportTableRoot = (props: ComponentProps<Parts>) => (
  <Suspense fallback={null}>
    <LoadedRoot {...props} />
  </Suspense>
);

const ReportTableHeader = (props: ComponentProps<Parts['Header']>) => {
  const { Header } = useParts();

  return <Header {...props} />;
};

const ReportTableBody = (props: ComponentProps<Parts['Body']>) => {
  const { Body } = useParts();

  return <Body {...props} />;
};

const ReportTableFooter = (props: ComponentProps<Parts['Footer']>) => {
  const { Footer } = useParts();

  return <Footer {...props} />;
};

const ReportTableHead = (props: ComponentProps<Parts['Head']>) => {
  const { Head } = useParts();

  return <Head {...props} />;
};

const ReportTableRow = (props: ComponentProps<Parts['Row']>) => {
  const { Row } = useParts();

  return <Row {...props} />;
};

const ReportTableCell = (props: ComponentProps<Parts['Cell']>) => {
  const { Cell } = useParts();

  return <Cell {...props} />;
};

const ReportTableCaption = (props: ComponentProps<Parts['Caption']>) => {
  const { Caption } = useParts();

  return <Caption {...props} />;
};

/**
 * A printable report's table, bordered, sized in em.
 * Put it in a `ReportPageContainer`, which scales it with the page's print size. Its parts are
 * named by `data-slot` (`table`, `table-row`, `table-cell`, …); its code loads with the first one.
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
