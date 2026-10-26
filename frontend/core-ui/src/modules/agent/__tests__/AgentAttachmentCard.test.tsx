/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes } from 'react';

import { AgentAttachmentCard } from '../components/AgentAttachmentCard';

/**
 * Attachment cards present sizes and file icons exactly like the platform's
 * own uploader (erxes-ui `formatBytes` / `getFileIcon`), loaded from source.
 */

jest.mock('erxes-ui/lib', () => ({ cn: () => '' }), { virtual: true });
jest.mock('erxes-ui/hooks/use-upload-new', () => ({}), { virtual: true });
jest.mock(
  'erxes-ui',
  () => {
    return {
      // The platform's real file helpers, from erxes-ui source.
      formatBytes: jest.requireActual(
        '../../../../../libs/erxes-ui/src/components/upload-new',
      ).formatBytes,
      getFileIcon: jest.requireActual(
        '../../../../../libs/erxes-ui/src/components/upload-new',
      ).getFileIcon,
      Spinner: () => <span />,
      Button: ({
        variant: _variant,
        size: _size,
        ...props
      }: ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        size?: string;
      }) => {
        void _variant;
        void _size;
        return <button {...props} />;
      },
    };
  },
  { virtual: true },
);

const iconOf = (container: HTMLElement): string =>
  Array.from(container.querySelector('svg')?.classList ?? []).find((name) =>
    name.startsWith('tabler-icon-'),
  ) ?? '';

it.each([
  [1536, 'Word · 1.54 KB'],
  [2_500_000, 'Word · 2.5 MB'],
  [800, 'Word · 800 bytes'],
])('shows a %i byte file as "%s", like the platform uploader', (size, text) => {
  render(
    <AgentAttachmentCard
      name="brief.docx"
      mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      size={size}
    />,
  );
  expect(screen.getByText(text)).toBeTruthy();
});

it.each([
  ['report.pdf', 'application/pdf', 'tabler-icon-file-text'],
  [
    'brief.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'tabler-icon-file-text',
  ],
  [
    'sales.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'tabler-icon-file-spreadsheet',
  ],
  ['notes.txt', 'text/plain', 'tabler-icon-file'],
])('draws the platform icon for %s', (name, mimeType, icon) => {
  const { container } = render(
    <AgentAttachmentCard name={name} mimeType={mimeType} size={10} />,
  );
  expect(iconOf(container)).toBe(icon);
});
