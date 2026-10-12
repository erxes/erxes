import { renderToStaticMarkup } from 'react-dom/server';
import { ToolbarFormattingButton } from '../ToolbarFormattingButton';

let mockCodeActive = false;

jest.mock('@blocknote/react', () => ({
  useBlockNoteEditor: () => ({
    getActiveStyles: () => ({ code: mockCodeActive }),
  }),
  useEditorContentOrSelectionChange: jest.fn(),
}));

jest.mock('@blocknote/shadcn', () => ({
  components: {
    FormattingToolbar: {
      Button: (props: {
        disabled?: boolean;
        isDisabled?: boolean;
        isSelected?: boolean;
      }) => (
        <button
          disabled={props.disabled ?? props.isDisabled}
          aria-pressed={props.isSelected}
        />
      ),
    },
  },
}));

describe('inline code toolbar mode', () => {
  afterEach(() => {
    mockCodeActive = false;
  });

  it.each([
    'bold',
    'italic',
    'underline',
    'strike',
    'fontFamily',
    'colors',
    'createLink',
  ])(
    'disables %s without showing it selected while code is active',
    (style) => {
      mockCodeActive = true;
      const markup = renderToStaticMarkup(
        <ToolbarFormattingButton
          label={style}
          data-test={style}
          isSelected
          disabled={false}
        />,
      );

      expect(markup).toContain('disabled=""');
      expect(markup).toContain('aria-pressed="false"');
    },
  );

  it('keeps code enabled so it can be toggled off', () => {
    mockCodeActive = true;
    const markup = renderToStaticMarkup(
      <ToolbarFormattingButton label="Code" data-test="code" isSelected />,
    );

    expect(markup).not.toContain('disabled=""');
    expect(markup).toContain('aria-pressed="true"');
  });

  it('shows the retained selected state after code is toggled off', () => {
    const markup = renderToStaticMarkup(
      <ToolbarFormattingButton label="Bold" data-test="bold" isSelected />,
    );

    expect(markup).not.toContain('disabled=""');
    expect(markup).toContain('aria-pressed="true"');
  });

  it('preserves paragraph alignment while code is active', () => {
    mockCodeActive = true;
    const markup = renderToStaticMarkup(
      <ToolbarFormattingButton
        label="Align left"
        data-test="alignTextLeft"
        isSelected
      />,
    );

    expect(markup).not.toContain('disabled=""');
    expect(markup).toContain('aria-pressed="true"');
  });
});
