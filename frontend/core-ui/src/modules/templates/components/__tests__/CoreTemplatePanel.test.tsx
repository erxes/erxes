/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { CoreTemplatePanel } from '../CoreTemplatePanel';
import { createStore, Provider } from 'jotai';
import { modulePanelTargetsState } from '@/side-panel/states/modulePanelState';

const mockDismissPath = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock('ui-modules', () => ({
  SidePanelDraftContext: jest
    .requireActual<typeof import('react')>('react')
    .createContext(undefined),
  SidePanelRecordPathContext: jest
    .requireActual<typeof import('react')>('react')
    .createContext(null),
  sidePanelHistoryState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom([]),
  usePermissionCheck: () => ({
    isLoaded: true,
    hasActionPermission: () => true,
  }),
  RecordSidePanel: {
    Header: ({ title }: { title: React.ReactNode }) => <h2>{title}</h2>,
  },
  useSidePanel: () => ({
    dismissPath: mockDismissPath,
    path: null,
    canGoBack: false,
    openPath: jest.fn(),
  }),
  TemplateForm: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>Cancel template</button>
  ),
}));
jest.mock('erxes-ui', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  useQueryState: () =>
    jest.requireActual<typeof import('react')>('react').useState(null),
}));

it('dismisses the template route before clearing its owning record ID', () => {
  const events: string[] = [];
  mockDismissPath.mockImplementation((path: string) => events.push(path));
  const store = createStore();
  const target = document.createElement('div');
  document.body.append(target);
  store.set(modulePanelTargetsState, {
    '/module/templates%2Fnew%2Fcore%3Aproduct%3AproductCategory%2Fcategory-1':
      target,
  });
  const view = render(
    <Provider store={store}>
      <CoreTemplatePanel
        contentType="core:product:productCategory"
        contentId="category-1"
        open
        onOpenChange={() => events.push('clear-template-id')}
      />
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cancel template' }));
  expect(events).toEqual([
    '/module/templates%2Fnew%2Fcore%3Aproduct%3AproductCategory%2Fcategory-1',
    'clear-template-id',
  ]);
  view.unmount();
  target.remove();
});
