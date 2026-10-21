import { useEffect, useState } from 'react';
import type {
  TSheetPreviewRequest,
  TSheetPreviewResult,
} from '../workers/sheetPreview.worker';

const SHEET_PREVIEW_ROWS = 500;

type TSheetPreview = Exclude<TSheetPreviewResult, { error: string }>;

export const useFileSheetPreview = (url: string, isCsv: boolean) => {
  const [sheet, setSheet] = useState<TSheetPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Classic worker: Rspack emits importScripts chunks.
    const worker = new Worker(
      new URL('../workers/sheetPreview.worker.ts', import.meta.url),
    );
    const request: TSheetPreviewRequest = {
      url,
      isCsv,
      maxRows: SHEET_PREVIEW_ROWS,
    };

    setSheet(null);
    setError(null);

    worker.onmessage = (event: MessageEvent<TSheetPreviewResult>) => {
      const result = event.data;

      if ('error' in result) {
        setError(result.error);
      } else {
        setSheet(result);
      }

      worker.terminate();
    };
    worker.onerror = (event) => {
      setError(event.message);
      worker.terminate();
    };
    worker.postMessage(request);

    return () => worker.terminate();
  }, [url, isCsv]);

  const rows = sheet?.rows || [];
  const columnCount = Math.max(0, ...rows.map((row) => row.length));
  const [header = [], ...body] = rows.map((row) =>
    Array.from({ length: columnCount }, (_, i) => row[i] ?? ''),
  );

  return {
    header,
    body,
    sheetName: sheet?.sheetName,
    otherSheets: Math.max(0, (sheet?.sheetCount || 1) - 1),
    truncated: !!sheet?.truncated,
    maxRows: SHEET_PREVIEW_ROWS,
    loading: !sheet && !error,
    error,
  };
};
