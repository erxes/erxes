import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  type NavigateOptions,
} from 'react-router-dom';
import { NotificationConversationDetail } from '../NotificationConversationDetail';

jest.mock('react-router-dom', () => {
  const { TextEncoder } =
    jest.requireActual<typeof import('node:util')>('node:util');
  Object.assign(globalThis, { TextEncoder });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});

jest.mock('erxes-ui', () => {
  const { useSearchParams } =
    jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    useQueryState: (key: string) => {
      const [params, setParams] = useSearchParams();
      return [
        params.get(key),
        (value: string, options?: NavigateOptions) => {
          const next = new URLSearchParams(params);
          next.set(key, value);
          setParams(next, options);
        },
      ];
    },
  };
});

jest.mock(
  '@/inbox/conversations/conversation-detail/components/ConversationDetail',
  () => ({ ConversationDetail: () => <p>Conversation detail</p> }),
);

describe('NotificationConversationDetail navigation', () => {
  it('returns to the list with one Back and reopens with Forward', () => {
    render(
      <StrictMode>
        <MemoryRouter
          initialEntries={[
            '/my-inbox?unread=true',
            '/my-inbox/notification-one',
          ]}
          initialIndex={1}
        >
          <NavigationControls />
          <Routes>
            <Route path="/my-inbox" element={<p>Notification list</p>} />
            <Route
              path="/my-inbox/:id"
              element={
                <NotificationConversationDetail contentTypeId="conversation-one" />
              }
            />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );

    expect(screen.getByTestId('location').textContent).toBe(
      '/my-inbox/notification-one?conversationId=conversation-one',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('location').textContent).toBe(
      '/my-inbox?unread=true',
    );
    expect(screen.getByText('Notification list')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
    expect(screen.getByTestId('location').textContent).toBe(
      '/my-inbox/notification-one?conversationId=conversation-one',
    );
    expect(screen.getByText('Conversation detail')).toBeTruthy();
  });

  it('corrects a stale conversation id without adding a history entry', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/previous',
          '/my-inbox/notification-two?conversationId=old&unread=true',
        ]}
        initialIndex={1}
      >
        <NavigationControls />
        <Routes>
          <Route path="/previous" element={<p>Previous notification</p>} />
          <Route
            path="/my-inbox/:id"
            element={
              <NotificationConversationDetail contentTypeId="conversation-two" />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location').textContent).toBe(
      '/my-inbox/notification-two?conversationId=conversation-two&unread=true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Previous notification')).toBeTruthy();
  });
});

const NavigationControls = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <output data-testid="location">
        {location.pathname}
        {location.search}
      </output>
    </>
  );
};
