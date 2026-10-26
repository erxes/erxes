/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { LegacyAgentRedirect } from '../components/LegacyAgentRedirect';
import { agentSidePanelThreadRequestState } from '../states/agentPanelStates';

jest.mock('react-router-dom', () => {
  const { TextEncoder } = jest.requireActual<typeof import('util')>('util');
  Object.defineProperty(globalThis, 'TextEncoder', {
    value: TextEncoder,
    configurable: true,
  });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});

jest.mock('ui-modules', () => ({
  SIDE_PANEL_CHAT_PATH: '/chat',
  SIDE_PANEL_QUERY_KEY: 'panel',
}));

const Workspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <p>
        {location.pathname}
        {location.search}
      </p>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
};

const openBookmark = (path: string) => {
  const store = createStore();
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={['/contacts/customers', path]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/agent/*" element={<LegacyAgentRedirect />} />
          <Route path="*" element={<Workspace />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return store;
};

it('replaces old thread bookmarks with the workspace Assistant route and requests the same thread', () => {
  const store = openBookmark('/agent/thread-1');
  expect(screen.getByText('/?panel=%2Fchat')).toBeTruthy();
  expect(store.get(agentSidePanelThreadRequestState)).toBe('thread-1');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByText('/contacts/customers')).toBeTruthy();
});

it.each(['/agent', '/agent/capabilities', '/agent/invalid/nested/path'])(
  'opens Assistant without a thread for %s',
  (path) => {
    const store = openBookmark(path);
    expect(screen.getByText('/?panel=%2Fchat')).toBeTruthy();
    expect(store.get(agentSidePanelThreadRequestState)).toBeNull();
  },
);
