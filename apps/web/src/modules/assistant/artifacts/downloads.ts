import type { AssistantArtifactFormat } from '@erxes/core-contract';
import { downloadBlob, downloadText } from '~/lib/download';
import { csvRows } from './csvRows';
import { reportDocument } from './reportDocument';

export type ArtifactDownload = 'pdf' | 'html' | 'xlsx' | 'csv' | 'docx' | 'md';

export const DOWNLOADS: Record<AssistantArtifactFormat, ArtifactDownload[]> = {
  html: ['pdf', 'html'],
  csv: ['xlsx', 'csv'],
  markdown: ['docx', 'pdf', 'md'],
};

export interface ReadyArtifact {
  title: string;
  filename: string;
  content: string;
  html: () => string;
}

const PRINT_WAIT_MS = 60_000;

const printDocument = (title: string, body: string) => {
  const frame = document.createElement('iframe');
  const remove = () => frame.remove();

  frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.srcdoc = reportDocument(title, body, 'light');
  frame.addEventListener(
    'load',
    () => {
      const view = frame.contentWindow;

      view?.addEventListener('afterprint', remove, { once: true });
      view?.focus();
      view?.print();
      setTimeout(remove, PRINT_WAIT_MS);
    },
    { once: true },
  );
  document.body.append(frame);
};

const stem = (filename: string) => filename.replace(/\.[^.]+$/, '');

export const downloadArtifact = async (kind: ArtifactDownload, artifact: ReadyArtifact) => {
  const name = stem(artifact.filename);

  switch (kind) {
    case 'pdf':
      return printDocument(artifact.title, artifact.html());
    case 'html':
      return downloadText(
        `${name}.html`,
        reportDocument(artifact.title, artifact.html(), 'light dark'),
        'text/html',
      );
    case 'csv':
      return downloadText(`${name}.csv`, `﻿${artifact.content}`, 'text/csv');
    case 'md':
      return downloadText(`${name}.md`, artifact.content, 'text/markdown');
    case 'xlsx': {
      const { csvToXlsx } = await import('./csvXlsx');

      return downloadBlob(
        `${name}.xlsx`,
        await csvToXlsx(artifact.title, csvRows(artifact.content)),
      );
    }

    case 'docx': {
      const { markdownToDocx } = await import('./markdownDocx');

      return downloadBlob(`${name}.docx`, await markdownToDocx(artifact.title, artifact.content));
    }
  }
};
