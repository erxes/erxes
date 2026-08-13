import { act, render } from '@testing-library/react';
import { CmsPostEditor } from './CmsPostEditor';

const mockParseBlocks = jest.fn();
const mockUseBlockEditor = jest.fn();
let mockEditorOnChange: (() => void) | undefined;

jest.mock('erxes-ui', () => ({
  BlockEditor: ({ onChange }: { onChange: () => void }) => {
    mockEditorOnChange = onChange;
    return null;
  },
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  parseBlocks: (value: string) => mockParseBlocks(value),
  useBlockEditor: (options: unknown) => mockUseBlockEditor(options),
}));

describe('CmsPostEditor content synchronization', () => {
  it('does not replace a newer edit after delayed legacy HTML parsing', async () => {
    let resolveParsedBlocks: ((blocks: unknown[]) => void) | undefined;
    const parsedBlocks = [
      {
        id: 'legacy-block',
        type: 'paragraph',
        props: {},
        content: [],
        children: [],
      },
    ];
    const editor = {
      document: [
        {
          id: 'initial-block',
          type: 'paragraph',
          props: {},
          content: [],
          children: [],
        },
      ],
      blocksToHTMLLossy: jest.fn().mockResolvedValue('<p>Edited</p>'),
      replaceBlocks: jest.fn(),
      tryParseHTMLToBlocks: jest.fn(
        () =>
          new Promise<unknown[]>((resolve) => {
            resolveParsedBlocks = resolve;
          }),
      ),
    };

    mockParseBlocks.mockReturnValue(undefined);
    mockUseBlockEditor.mockReturnValue(editor);

    const { unmount } = render(
      <CmsPostEditor
        initialContent="<p>Legacy content</p>"
        onChange={jest.fn()}
        uploadFile={jest.fn().mockResolvedValue('uploaded-url')}
      />,
    );

    expect(editor.tryParseHTMLToBlocks).toHaveBeenCalledWith(
      '<p>Legacy content</p>',
    );

    act(() => {
      editor.document = [
        {
          id: 'edited-block',
          type: 'paragraph',
          props: {},
          content: [],
          children: [],
        },
      ];
      mockEditorOnChange?.();
    });

    await act(async () => {
      resolveParsedBlocks?.(parsedBlocks);
      await Promise.resolve();
    });

    expect(editor.replaceBlocks).not.toHaveBeenCalled();

    unmount();
  });
});
