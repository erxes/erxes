/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { Toolbar } from '../Toolbar';

jest.mock('@blocknote/react', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const EmptyButton = () => null;

  return {
    FormattingToolbarController: ({
      formattingToolbar: Contents,
    }: {
      formattingToolbar: import('react').ComponentType;
    }) => <Contents />,
    FormattingToolbar: ({ children }: { children: import('react').ReactNode }) => (
      <div role="toolbar">{children}</div>
    ),
    BasicTextStyleButton: ({ basicTextStyle }: { basicTextStyle: string }) => {
      const [pressed, setPressed] = React.useState(false);
      return (
        <button
          type="button"
          aria-label={basicTextStyle}
          aria-pressed={pressed}
          onClick={() => setPressed((value) => !value)}
        />
      );
    },
    BlockTypeSelect: EmptyButton,
    ColorStyleButton: EmptyButton,
    CreateLinkButton: EmptyButton,
    FileCaptionButton: EmptyButton,
    FileReplaceButton: EmptyButton,
    NestBlockButton: EmptyButton,
    TableCellMergeButton: EmptyButton,
    TextAlignButton: EmptyButton,
    UnnestBlockButton: EmptyButton,
  };
});

jest.mock('../FontFamilyButton', () => ({ FontFamilyButton: () => null }));
jest.mock('../ImageStyleButton', () => ({ ImageStyleButton: () => null }));

it('preserves toolbar controls, focus and state when the editor parent renders again', () => {
  const { rerender } = render(<Toolbar />);
  const bold = screen.getByRole('button', { name: 'bold' });
  bold.focus();
  fireEvent.click(bold);

  rerender(<Toolbar />);

  expect(screen.getByRole('button', { name: 'bold' })).toBe(bold);
  expect(document.activeElement).toBe(bold);
  expect(bold.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(bold);
  expect(bold.getAttribute('aria-pressed')).toBe('false');
});
