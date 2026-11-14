/** @jest-environment jsdom */
import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { GlobalSidebar } from '../components/GlobalSidebar';
import { globalSidebarToolState } from '../states/globalSidebarState';

let mockPath: string | null = null;
const mockDismiss = jest.fn();

jest.mock('ui-modules', () => ({
  SIDE_PANEL_CHAT_PATH: '/chat',
  useSidePanel: () => ({ path: mockPath, dismissPath: mockDismiss }),
}));
jest.mock(
  '@/side-panel/components/chat/AssistantPanel',
  () => ({ AssistantPanel: () => null }),
  { virtual: true },
);

beforeEach(() => {
  localStorage.clear();
  mockDismiss.mockClear();
});

it('hands an old ?panel=/chat link to the global sidebar', () => {
  mockPath = '/chat';
  const store = createStore();
  render(
    <Provider store={store}>
      <GlobalSidebar />
    </Provider>,
  );
  expect(store.get(globalSidebarToolState)).toBe('assistant');
  expect(mockDismiss).toHaveBeenCalledWith('/chat');
});

it('leaves record panels alone', () => {
  mockPath = '/core:customer/c1';
  const store = createStore();
  render(
    <Provider store={store}>
      <GlobalSidebar />
    </Provider>,
  );
  expect(store.get(globalSidebarToolState)).toBeNull();
  expect(mockDismiss).not.toHaveBeenCalled();
});
