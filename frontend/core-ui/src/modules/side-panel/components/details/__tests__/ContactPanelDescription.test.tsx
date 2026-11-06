/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ContactPanelDescription } from '../ContactPanelDescription';

const mockCustomerEdit = jest.fn();
const mockCompaniesEdit = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock('ui-modules', () => ({
  PanelDescriptionField: ({ label }: { label: string }) => <div>{label}</div>,
  useCustomerEdit: () => ({ customerEdit: mockCustomerEdit }),
  useCompaniesEdit: () => ({ companiesEdit: mockCompaniesEdit }),
}));
jest.mock('erxes-ui', () => ({
  Spinner: () => <div>Loading</div>,
  ScrollArea: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Editor: ({
    initialContent,
    onChange,
    readonly,
  }: {
    initialContent: string;
    onChange: (value: string) => void;
    readonly?: boolean;
  }) => (
    <div
      role="textbox"
      tabIndex={0}
      contentEditable={!readonly}
      suppressContentEditableWarning
      onInput={(event) => onChange(event.currentTarget.textContent || '')}
    >
      {initialContent}
    </div>
  ),
}));

const props = {
  contentType: 'core:customer' as const,
  contentId: 'contact-1',
  value: 'Saved description',
};

beforeEach(() => {
  jest.clearAllMocks();
  const rects = [document.body.getBoundingClientRect()];
  jest
    .spyOn(HTMLElement.prototype, 'getClientRects')
    .mockReturnValue(
      Object.assign(rects, { item: (index: number) => rects[index] || null }),
    );
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it('shows the full editor without a second Description label and focuses it with /', () => {
  render(<ContactPanelDescription {...props} />);
  expect(screen.queryByText('Description')).toBeNull();
  const event = new KeyboardEvent('keydown', {
    key: '/',
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(event);
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
  expect(event.defaultPrevented).toBe(true);
});

it('leaves / alone inside inputs and the editor', () => {
  render(
    <>
      <input aria-label="Search" />
      <ContactPanelDescription {...props} />
    </>,
  );
  for (const target of [
    screen.getByLabelText('Search'),
    screen.getByRole('textbox', { name: '' }),
  ]) {
    target.focus();
    const event = new KeyboardEvent('keydown', {
      key: '/',
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    expect(document.activeElement).toBe(target);
    expect(event.defaultPrevented).toBe(false);
  }
});

it('does not focus an inactive tab or a read-only editor', () => {
  const view = render(
    <div role="tabpanel" data-state="inactive">
      <ContactPanelDescription {...props} />
    </div>,
  );
  fireEvent.keyDown(document.body, { key: '/' });
  expect(document.activeElement).toBe(document.body);
  view.rerender(<ContactPanelDescription {...props} readonly />);
  fireEvent.keyDown(document.body, { key: '/' });
  expect(document.activeElement).toBe(document.body);
});

it('does not steal shortcuts while a dialog is open or modifiers are held', () => {
  const view = render(
    <>
      <div role="dialog" />
      <ContactPanelDescription {...props} />
    </>,
  );
  fireEvent.keyDown(document.body, { key: '/' });
  expect(document.activeElement).toBe(document.body);
  view.rerender(<ContactPanelDescription {...props} />);
  fireEvent.keyDown(document.body, { key: '/', ctrlKey: true });
  expect(document.activeElement).toBe(document.body);
});

it.each(['core:customer', 'core:company'] as const)(
  'saves %s changes after leaving the editor, without saving unchanged content',
  (contentType) => {
    jest.useFakeTimers();
    render(<ContactPanelDescription {...props} contentType={contentType} />);
    const editor = screen.getByRole('textbox');
    fireEvent.blur(editor);
    act(() => jest.advanceTimersByTime(350));
    expect(mockCustomerEdit).not.toHaveBeenCalled();
    expect(mockCompaniesEdit).not.toHaveBeenCalled();
    fireEvent.input(editor, { target: { textContent: 'Updated description' } });
    fireEvent.blur(editor);
    act(() => jest.advanceTimersByTime(350));
    const save =
      contentType === 'core:customer' ? mockCustomerEdit : mockCompaniesEdit;
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({
      variables: { _id: 'contact-1', description: 'Updated description' },
    });
  },
);
