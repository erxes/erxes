/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes } from 'react';
import { AttachedFiles } from '../components/AttachedFiles';
import type { IAgentsFileMeta } from '../agentsFiles';

jest.mock('erxes-ui/lib', () => ({ cn: () => '' }), { virtual: true });
jest.mock('erxes-ui/hooks/use-upload-new', () => ({}), { virtual: true });
jest.mock('erxes-ui', () => ({
  // The platform's real file helpers, from erxes-ui source.
  formatBytes: jest.requireActual(
    '../../../../../libs/erxes-ui/src/components/upload-new',
  ).formatBytes,
  getFileIcon: jest.requireActual(
    '../../../../../libs/erxes-ui/src/components/upload-new',
  ).getFileIcon,
  Button: ({
    variant: _variant,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button {...props} />
  ),
  Spinner: () => <span />,
  readImage: (url: string) => url.startsWith('https://')
    ? url
    : `/read-file?key=${encodeURIComponent(url)}`,
}), { virtual: true });

const image: IAgentsFileMeta = {
  name: 'photo.png', url: 'bucket/photo.png', type: 'image/png', size: 100,
};
const document: IAgentsFileMeta = {
  name: 'report.pdf', url: 'report.pdf', type: 'application/pdf', size: 100,
};

afterEach(() => jest.restoreAllMocks());

it('shows an inline image instead of a filename chip and opens the original', () => {
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  render(<AttachedFiles files={[image]} notice="" />);
  const preview = screen.getByRole('img', { name: image.name });
  expect(preview.getAttribute('src')).toBe('/read-file?key=bucket%2Fphoto.png');
  expect(screen.queryByText(image.name)).toBeNull();
  expect(screen.getByRole('status', { name: 'Loading image' })).not.toBeNull();
  fireEvent.load(preview);
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: `Open ${image.name}` }));
  expect(open).toHaveBeenCalledWith('/read-file?key=bucket%2Fphoto.png', '_blank', 'noopener,noreferrer');
});

it('keeps document labels and downloads unchanged in mixed messages', () => {
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  render(<AttachedFiles files={[image, document]} notice="" />);
  expect(screen.getAllByRole('img')).toHaveLength(1);
  const card = screen.getByRole('button', { name: `Open ${document.name}` });
  expect(card.textContent).toContain('report.pdf');
  expect(card.textContent).toContain('PDF · 100 bytes');
  fireEvent.click(card);
  expect(open).toHaveBeenCalledWith('/read-file?key=report.pdf', '_blank', 'noopener,noreferrer');
});

it('shows several images as square tiles in one row', () => {
  const second = { ...image, name: 'chart.png', url: 'bucket/chart.png' };
  render(<AttachedFiles files={[image, second]} notice="" />);
  const tiles = screen.getAllByRole('button', { name: /^Open / });
  expect(tiles).toHaveLength(2);
  expect(tiles[0].className).toContain('size-28');
});

it('falls back to a working filename chip if the preview fails', () => {
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  render(<AttachedFiles files={[image]} notice="" />);
  fireEvent.error(screen.getByRole('img', { name: image.name }));
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByRole('status')).toBeNull();
  const card = screen.getByRole('button', { name: `Open ${image.name}` });
  expect(card.textContent).toContain('Image · 100 bytes');
  fireEvent.click(card);
  expect(open).toHaveBeenCalled();
});

it('renders CDN image previews when reopening a message', () => {
  const cdnImage = { ...image, url: 'https://imagedelivery.net/account/photo/public' };
  render(<AttachedFiles files={[cdnImage]} notice="" />);
  expect(screen.getByRole('img', { name: image.name }).getAttribute('src')).toBe(cdnImage.url);
});
