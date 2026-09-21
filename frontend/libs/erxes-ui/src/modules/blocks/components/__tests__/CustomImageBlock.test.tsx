import { fireEvent, render } from '@testing-library/react';
import { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react';
import { customImageBlock } from '../CustomImageBlock';

jest.mock('@blocknote/core', () => ({
  imageBlockConfig: { type: 'image', propSchema: {} },
}));
jest.mock('@blocknote/react', () => ({
  createReactBlockSpec: (
    _config: unknown,
    implementation: { render: ComponentType },
  ) => implementation.render,
  useResolveUrl: (url: string) => ({
    loadingState: 'loaded',
    downloadUrl: url,
  }),
  useUploadLoading: () => false,
  ResizableFileBlockWrapper: ({ children }: { children: ReactNode }) => (
    <div className="bn-file-block-content-wrapper">{children}</div>
  ),
}));
jest.mock('erxes-ui/components', () => ({
  Button: ({
    children,
    onClick,
    onMouseDown,
    'aria-label': label,
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} onMouseDown={onMouseDown} aria-label={label}>
      {children}
    </button>
  ),
  Dialog: Object.assign(() => null, {
    Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  }),
  Spinner: () => null,
}));

const renderImage = (previewWidth: number, isEditable = true) => {
  const block = {
    id: 'image',
    props: {
      url: 'image.png',
      name: 'Test image',
      caption: '',
      previewWidth,
      imageStyle: 'normal',
    },
  };
  const editor = {
    isEditable,
    updateBlock: jest.fn(),
    dictionary: { file_blocks: { image: { add_button_text: 'Add image' } } },
  };
  const ImageBlock = customImageBlock as unknown as ComponentType<{
    block: typeof block;
    editor: typeof editor;
  }>;
  const result = render(<ImageBlock block={block} editor={editor} />);
  return { ...result, block, editor };
};

const loadImage = (image: HTMLElement, width: number, height: number) => {
  Object.defineProperties(image, {
    naturalWidth: { value: width, configurable: true },
    naturalHeight: { value: height, configurable: true },
  });
  fireEvent.load(image);
};

it.each([
  [600, 1800, (600 / 1800) * 320],
  [1000, 1000, 320],
  [1920, 1080, 480],
])(
  'caps the resize box for a %s by %s image with a saved wide width',
  (width, height, maxWidth) => {
    const { container, getByAltText, editor } = renderImage(720);
    loadImage(getByAltText('Test image'), width, height);

    expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe(
      `min(100%, ${maxWidth}px)`,
    );
    expect(editor.updateBlock).not.toHaveBeenCalled();
  },
);

it.each([true, false])(
  'only initializes stored dimensions when editable is %s',
  (isEditable) => {
    const { getByAltText, editor, block } = renderImage(0, isEditable);
    loadImage(getByAltText('Test image'), 600, 1800);

    if (isEditable) {
      expect(editor.updateBlock).toHaveBeenCalledWith(block, {
        props: { previewWidth: (600 / 1800) * 320 },
      });
    } else {
      expect(editor.updateBlock).not.toHaveBeenCalled();
    }
  },
);
