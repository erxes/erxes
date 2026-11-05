/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { CoreTemplatePanel } from '../CoreTemplatePanel';

const mockDismissPath = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({ dismissPath: mockDismissPath }),
  TemplateForm: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>Cancel template</button>
  ),
}));
jest.mock('@/side-panel/components/CoreModulePanel', () => {
  const Container = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );
  return {
    CoreModulePanel: Object.assign(Container, {
      View: Container,
      Header: Container,
      Title: Container,
      Close: () => null,
    }),
  };
});

it('dismisses the template route before clearing its owning record ID', () => {
  const events: string[] = [];
  mockDismissPath.mockImplementation((path: string) => events.push(path));
  render(
    <CoreTemplatePanel
      contentType="core:product:productCategory"
      contentId="category-1"
      open
      onOpenChange={() => events.push('clear-template-id')}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cancel template' }));
  expect(events).toEqual([
    '/module/templates%2Fnew%2Fcore%3Aproduct%3AproductCategory%2Fcategory-1',
    'clear-template-id',
  ]);
});
