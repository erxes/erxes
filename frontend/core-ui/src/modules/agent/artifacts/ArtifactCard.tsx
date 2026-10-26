import { useAgentReferenceRegistry } from '../references/AgentReferenceScope';
import { referenceNamesForHtmlExport } from '../references/referenceRegistry';
import {
  IconCheck,
  IconCode,
  IconEye,
  IconCopy,
  IconDownload,
  IconLoader2,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Suspense, lazy, useEffect, useState } from 'react';

import { parseDelimitedTable } from './converters/csv';
import { downloadBlob } from './download';
import { HtmlPreview } from './HtmlPreview';
import type { IArtifact } from './types';

const SpreadsheetPreview = lazy(() =>
  import('./previews/SpreadsheetPreview').then((m) => ({
    default: m.SpreadsheetPreview,
  })),
);
const DocxPreview = lazy(() =>
  import('./previews/DocxPreview').then((m) => ({ default: m.DocxPreview })),
);
const PdfPreview = lazy(() =>
  import('./previews/PdfPreview').then((m) => ({ default: m.PdfPreview })),
);

const PreviewFallback = () => (
  <div className="flex h-full min-h-[120px] items-center justify-center">
    <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
  </div>
);

interface IArtifactCardProps {
  artifact: IArtifact;
}

export const ArtifactCard = ({ artifact }: IArtifactCardProps) => {
  const referenceRegistry = useAgentReferenceRegistry();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [documentFailed, setDocumentFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const needsDocument = artifact.type === 'docx' || artifact.type === 'pdf';

  useEffect(() => {
    if (!needsDocument) {
      return;
    }

    let cancelled = false;
    setDocumentBlob(null);
    setDocumentFailed(false);

    const generate = async () => {
      try {
        const blob =
          artifact.type === 'docx'
            ? await (
                await import('./converters/docx')
              ).markdownToDocxBlob(artifact.content)
            : await (
                await import('./converters/pdf')
              ).markdownToPdfBlob(artifact.content);

        if (!cancelled) {
          setDocumentBlob(blob);
        }
      } catch {
        if (!cancelled) {
          setDocumentFailed(true);
        }
      }
    };

    void generate();

    return () => {
      cancelled = true;
    };
  }, [needsDocument, artifact.type, artifact.content, attempt]);

  const handleCopy = async () => {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  const handleDownload = async () => {
    setDownloadBusy(true);
    setDownloadFailed(false);

    try {
      if (artifact.type === 'html') {
        downloadBlob(
          new Blob(
            [referenceNamesForHtmlExport(artifact.content, referenceRegistry)],
            { type: 'text/html;charset=utf-8' },
          ),
          artifact.filename,
        );
      } else if (artifact.type === 'xlsx') {
        const rows = parseDelimitedTable(artifact.content).rows;
        const { tableToXlsxBlob } = await import('./converters/xlsx');

        downloadBlob(await tableToXlsxBlob(rows), artifact.filename);
      } else if (documentBlob) {
        downloadBlob(documentBlob, artifact.filename);
      } else {
        setDownloadFailed(true);
      }
    } catch {
      setDownloadFailed(true);
    } finally {
      setDownloadBusy(false);
    }
  };

  const renderPreview = () => {
    if (artifact.type === 'html') {
      return (
        <HtmlPreview
          html={artifact.content}
          title={artifact.title}
          references
        />
      );
    }

    if (artifact.type === 'xlsx') {
      return (
        <Suspense fallback={<PreviewFallback />}>
          <SpreadsheetPreview content={artifact.content} />
        </Suspense>
      );
    }

    if (documentFailed) {
      return (
        <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6">
          <p className="text-sm text-muted-foreground">
            Preview could not be generated.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (!documentBlob) {
      return <PreviewFallback />;
    }

    return (
      <Suspense fallback={<PreviewFallback />}>
        {artifact.type === 'docx' ? (
          <DocxPreview blob={documentBlob} />
        ) : (
          <PdfPreview blob={documentBlob} />
        )}
      </Suspense>
    );
  };

  return (
    <div
      className={
        artifact.type === 'html'
          ? 'min-w-0'
          : 'overflow-hidden rounded-xl border'
      }
    >
      <div className="mb-2 flex items-center justify-between gap-2 py-1 text-muted-foreground">
        <span className="truncate text-xs font-medium" title={artifact.title}>
          {artifact.title}
        </span>
        <div className="flex shrink-0 items-center">
          {artifact.type === 'html' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setShowSource((value) => !value)}
              aria-pressed={showSource}
              aria-label={showSource ? 'Show preview' : 'View source'}
            >
              {showSource ? (
                <IconEye className="size-3.5" />
              ) : (
                <IconCode className="size-3.5" />
              )}
              {showSource ? 'Preview' : 'Source'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy source"
            aria-label={copied ? 'Source copied' : 'Copy source'}
            className="size-7"
          >
            {copied ? (
              <IconCheck className="size-3.5 text-emerald-600" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={downloadBusy || (needsDocument && !documentBlob)}
            title="Download"
            aria-label="Download artifact"
            className="size-7"
          >
            {downloadBusy ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <IconDownload className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={
          artifact.type === 'xlsx' || artifact.type === 'html'
            ? ''
            : 'h-[320px] sm:h-[380px]'
        }
      >
        {showSource ? (
          <pre className="max-h-[32rem] overflow-auto rounded-lg bg-muted/40 p-4 text-xs leading-relaxed">
            <code>{artifact.content}</code>
          </pre>
        ) : (
          renderPreview()
        )}
      </div>
      {copyFailed && (
        <p role="alert" className="px-1 py-2 text-xs text-destructive">
          Could not copy source. Please try again.
        </p>
      )}
      {downloadFailed && (
        <p className="px-3 pb-2 text-xs text-destructive">
          Download failed — please try again.
        </p>
      )}
    </div>
  );
};
