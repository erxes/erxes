import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ReactNode } from 'react';
import { kbSidebarOpenTopicIdsAtom } from '@/knowledgebase/sidebar/states/kbSidebarOpenTopicsState';
import { useTopicOpenState } from '../useTopicOpenState';

const setup = (topicId?: string) => {
  const store = createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useTopicOpenState(topicId), { wrapper });

  return { store, hook };
};

describe('useTopicOpenState', () => {
  it('starts closed', () => {
    const { hook } = setup('topic-1');

    expect(hook.result.current.isOpen).toBe(false);
  });

  it('opens and closes a topic', () => {
    const { store, hook } = setup('topic-1');

    act(() => hook.result.current.setOpen(true));
    expect(hook.result.current.isOpen).toBe(true);
    expect(store.get(kbSidebarOpenTopicIdsAtom)).toEqual(['topic-1']);

    act(() => hook.result.current.setOpen(false));
    expect(hook.result.current.isOpen).toBe(false);
    expect(store.get(kbSidebarOpenTopicIdsAtom)).toEqual([]);
  });

  it('does not duplicate a topic that is opened twice', () => {
    const { store, hook } = setup('topic-1');

    act(() => hook.result.current.setOpen(true));
    act(() => hook.result.current.setOpen(true));

    expect(store.get(kbSidebarOpenTopicIdsAtom)).toEqual(['topic-1']);
  });

  it('keeps other open topics untouched', () => {
    const { store, hook } = setup('topic-1');

    store.set(kbSidebarOpenTopicIdsAtom, ['topic-2']);
    act(() => hook.result.current.setOpen(true));
    act(() => hook.result.current.setOpen(false));

    expect(store.get(kbSidebarOpenTopicIdsAtom)).toEqual(['topic-2']);
  });

  it('ignores calls without a topic id', () => {
    const { store, hook } = setup(undefined);

    act(() => hook.result.current.setOpen(true));

    expect(hook.result.current.isOpen).toBe(false);
    expect(store.get(kbSidebarOpenTopicIdsAtom)).toEqual([]);
  });
});
