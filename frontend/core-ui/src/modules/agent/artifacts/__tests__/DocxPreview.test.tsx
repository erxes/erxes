/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { DocxPreview } from '../previews/DocxPreview';

jest.mock('docx-preview', () => {
  throw new Error('Loading chunk failed');
});

it('shows the download fallback when the preview chunk cannot load', async () => {
  render(<DocxPreview blob={new Blob(['document'])} />);

  expect(
    await screen.findByText(
      'Preview unavailable — use Download to open the file.',
    ),
  ).toBeTruthy();
});
