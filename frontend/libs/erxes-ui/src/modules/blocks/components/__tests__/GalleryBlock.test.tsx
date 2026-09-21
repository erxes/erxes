import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react';
import { galleryBlock } from '../GalleryBlock';
import { useToast } from 'erxes-ui/hooks';

jest.mock('@blocknote/react', () => ({
  createReactBlockSpec: (
    _config: unknown,
    implementation: { render: ComponentType },
  ) => implementation.render,
  useResolveUrl: (url: string) => ({
    loadingState: 'loaded',
    downloadUrl: url,
  }),
}));
jest.mock('erxes-ui/lib', () => ({ cn: () => '' }));
jest.mock('erxes-ui/utils', () => ({ readImage: (url: string) => url }));
jest.mock('erxes-ui/hooks', () => ({ useToast: jest.fn() }));
jest.mock('erxes-ui/components', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Dialog: Object.assign(() => null, {
    Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  }),
  Spinner: () => null,
}));

it('retains successful gallery uploads and identifies failed files', async () => {
  const toast = jest.fn();
  jest
    .mocked(useToast)
    .mockReturnValue({ toast } as ReturnType<typeof useToast>);
  const block = { id: 'gallery', props: { images: '[]', columns: '3' } };
  const editor = {
    isEditable: true,
    uploadFile: jest
      .fn()
      .mockResolvedValueOnce('uploads/first.png')
      .mockRejectedValueOnce(new Error('Upload failed'))
      .mockResolvedValueOnce({ props: { url: 'uploads/third.png' } }),
    getBlock: jest.fn().mockReturnValue(block),
    updateBlock: jest.fn(),
  };
  const Gallery = galleryBlock as unknown as ComponentType<{
    block: typeof block;
    editor: typeof editor;
  }>;
  const { container } = render(<Gallery block={block} editor={editor} />);
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('Gallery upload input missing');

  fireEvent.change(input, {
    target: {
      files: ['first.png', 'second.png', 'third.png'].map(
        (name) => new File(['image'], name, { type: 'image/png' }),
      ),
    },
  });

  await waitFor(() => expect(editor.updateBlock).toHaveBeenCalledTimes(1));
  expect(editor.updateBlock).toHaveBeenCalledWith(block, {
    props: {
      images: JSON.stringify([
        { url: 'uploads/first.png' },
        { url: 'uploads/third.png' },
      ]),
    },
  });
  expect(toast).toHaveBeenCalledWith({
    title: 'Failed to upload gallery images',
    description: 'second.png',
    variant: 'destructive',
  });
  expect(
    screen
      .getByRole('button', { name: 'Add images to gallery' })
      .hasAttribute('disabled'),
  ).toBe(false);
});
