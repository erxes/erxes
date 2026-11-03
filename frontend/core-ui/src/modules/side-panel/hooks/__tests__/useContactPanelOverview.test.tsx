/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { IconMail } from '@tabler/icons-react';
import { Provider } from 'jotai';
import { useContactPanelOverview } from '../useContactPanelOverview';

jest.mock('../useContactWidgetModules', () => ({
  useContactWidgetModules: () => [
    { pluginName: 'frontline', name: 'conversation', label: 'Conversations' },
  ],
}));
const relation = {
  value: 'frontline.conversation',
  label: 'Conversations',
  icon: IconMail,
  content: <p>Conversation fallback</p>,
};
beforeEach(() => localStorage.clear());

it('keeps a pinned module available through its relation widget when the section fails', () => {
  const { result } = renderHook(
    () => useContactPanelOverview('core:customer', [relation]),
    { wrapper: Provider },
  );
  expect(result.current.allEntries.map((entry) => entry.kind)).toEqual([
    'section',
  ]);
  act(() => result.current.onToggleTab('frontline.conversation'));
  expect(result.current.pinned.map((entry) => entry.key)).toEqual([
    'frontline.conversation',
  ]);
  act(() => result.current.onUnavailable('frontline.conversation'));
  expect(result.current.allEntries.map((entry) => entry.kind)).toEqual([
    'widget',
  ]);
  expect(result.current.pinned.map((entry) => entry.key)).toEqual([
    'frontline.conversation',
  ]);
  act(() => result.current.onToggleTab('frontline.conversation'));
  expect(result.current.pinned).toEqual([]);
});

it('does not persist contact customization for a plugin record', () => {
  const { result } = renderHook(
    () => useContactPanelOverview('operation:task', [relation]),
    { wrapper: Provider },
  );
  act(() => {
    result.current.onToggleTab('frontline.conversation');
    result.current.onReorder(['frontline.conversation']);
  });
  expect(result.current.contactType).toBeNull();
  expect(result.current.moreTabs).toEqual([relation]);
  expect(localStorage.getItem('erxes:contactOverviewLayout')).toBeNull();
});
