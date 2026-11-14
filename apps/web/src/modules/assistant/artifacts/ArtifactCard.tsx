import type { AssistantArtifact, AssistantArtifactFormat } from '@erxes/core-contract';
import {
  IconArrowsMaximize,
  IconChartBar,
  IconDownload,
  IconFileText,
  IconTable,
  type Icon,
} from '@tabler/icons-react';
import { Button, Dialog, DropdownMenu, useToast } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { type RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { Reply } from '../Reply';
import { CsvTable, HtmlFrame } from './ArtifactPreview';
import { csvRows } from './csvRows';
import {
  type ArtifactDownload,
  DOWNLOADS,
  downloadArtifact,
  type ReadyArtifact,
} from './downloads';
import { escapeHtml } from './reportDocument';
import { useReferenceLabels } from './useReferenceLabels';

const ICONS: Record<AssistantArtifactFormat, Icon> = {
  html: IconChartBar,
  csv: IconTable,
  markdown: IconFileText,
};

const CARD_ROWS = 6;

const kindLabel = (format: AssistantArtifactFormat, t: TFunction<'assistant'>) =>
  ({
    html: t('artifact.html', 'Report'),
    csv: t('artifact.csv', 'Table'),
    markdown: t('artifact.markdown', 'Document'),
  })[format];

const downloadLabel = (kind: ArtifactDownload, t: TFunction<'assistant'>) =>
  ({
    pdf: t('artifact.pdf', 'Print or save as PDF'),
    html: t('artifact.download-html', 'HTML file'),
    xlsx: t('artifact.download-xlsx', 'Excel workbook (.xlsx)'),
    csv: t('artifact.download-csv', 'CSV file'),
    docx: t('artifact.download-docx', 'Word document (.docx)'),
    md: t('artifact.download-md', 'Markdown file'),
  })[kind];

const csvCell = (cell: string) =>
  /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;

const useReadyArtifact = (artifact: AssistantArtifact, printed: RefObject<HTMLElement | null>) => {
  const resolve = useReferenceLabels(artifact.content);

  const rows =
    artifact.format === 'csv'
      ? csvRows(artifact.content).map((row) => row.map((cell) => resolve(cell)))
      : [];

  const html = artifact.format === 'html' ? resolve(artifact.content, escapeHtml) : '';

  const ready: ReadyArtifact = {
    title: artifact.title,
    filename: artifact.filename,
    content:
      artifact.format === 'csv'
        ? rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
        : resolve(artifact.content),
    html: () => (artifact.format === 'html' ? html : (printed.current?.innerHTML ?? '')),
  };

  return { ready, rows, html };
};

const DownloadMenu = ({
  artifact,
  ready,
}: {
  artifact: AssistantArtifact;
  ready: ReadyArtifact;
}) => {
  const { t } = useTranslation('assistant');
  const { toast } = useToast();
  const label = t('artifact.download', 'Download');

  const save = (kind: ArtifactDownload) =>
    void downloadArtifact(kind, ready).catch(() =>
      toast({
        variant: 'destructive',
        title: t('artifact.download-failed', 'Could not create the file'),
      }),
    );

  return (
    <DropdownMenu>
      <IconTip label={label}>
        <DropdownMenu.Trigger
          aria-label={label}
          render={<Button variant="ghost" size="icon" tone="muted" />}
        >
          <IconDownload className="size-4" />
        </DropdownMenu.Trigger>
      </IconTip>
      <DropdownMenu.Content align="end" className="min-w-48">
        {DOWNLOADS[artifact.format].map((kind) => (
          <DropdownMenu.Item key={kind} onClick={() => save(kind)}>
            {downloadLabel(kind, t)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const Preview = ({
  artifact,
  rows,
  html,
  limit,
}: {
  artifact: AssistantArtifact;
  rows: string[][];
  html: string;
  limit?: number;
}) => {
  switch (artifact.format) {
    case 'html':
      return <HtmlFrame title={artifact.title} html={html} />;
    case 'csv':
      return <CsvTable rows={rows} limit={limit} label={artifact.title} />;
    case 'markdown':
      return (
        <div className="p-3">
          <Reply text={artifact.content} streaming={false} />
        </div>
      );
  }
};

const FullView = ({
  artifact,
  open,
  onOpenChange,
  children,
}: {
  artifact: AssistantArtifact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('assistant');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="flex max-h-lightbox flex-col sm:max-w-4xl">
        <Dialog.HeaderCombined title={artifact.title} description={kindLabel(artifact.format, t)} />
        <div className="min-h-0 flex-1 overflow-auto rounded-md border">{children}</div>
      </Dialog.Content>
    </Dialog>
  );
};

export const ArtifactCard = ({ artifact }: { artifact: AssistantArtifact }) => {
  const { t } = useTranslation('assistant');
  const printed = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { ready, rows, html } = useReadyArtifact(artifact, printed);
  const FormatIcon = ICONS[artifact.format];
  const openLabel = t('artifact.open', 'Open');
  const rowCount = Math.max(0, rows.length - 1);

  return (
    <section
      aria-label={artifact.title}
      className="overflow-hidden rounded-lg border bg-background"
    >
      <header className="flex items-center gap-2 border-b py-1.5 pr-1.5 pl-3">
        <FormatIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{artifact.title}</span>
          <span className="truncate text-xs text-muted-foreground">
            {artifact.format === 'csv'
              ? t('artifact.rows', '{{kind}} · {{count}} rows', {
                  kind: kindLabel('csv', t),
                  count: rowCount,
                })
              : kindLabel(artifact.format, t)}
          </span>
        </span>
        <IconTip label={openLabel}>
          <Button
            variant="ghost"
            size="icon"
            tone="muted"
            aria-label={openLabel}
            onClick={() => setOpen(true)}
          >
            <IconArrowsMaximize className="size-4" />
          </Button>
        </IconTip>
        <DownloadMenu artifact={artifact} ready={ready} />
      </header>
      <div ref={printed} className="max-h-64 overflow-hidden">
        <Preview artifact={artifact} rows={rows} html={html} limit={CARD_ROWS} />
      </div>
      <FullView artifact={artifact} open={open} onOpenChange={setOpen}>
        <Preview artifact={artifact} rows={rows} html={html} />
      </FullView>
    </section>
  );
};
