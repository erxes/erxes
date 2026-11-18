import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';
import { TPanelFormDrafts, usePanelFormDraft } from '../usePanelFormDraft';

jest.mock('erxes-ui', () => {
  const deepEqual = jest.requireActual('deep-equal');
  return {
    isDeeplyEqual: (a: unknown, b: unknown, options?: { strict: boolean }) =>
      deepEqual(a, b, options),
    useConfirm: () => ({ confirm: jest.fn(() => Promise.resolve()) }),
  };
});

type TValues = { name: string; description: string };

const SAVED: TValues = { name: 'Support', description: 'Help desk' };
const RECORD = 'channel-1';

const setup = () => {
  const store = createStore();
  const draftsState = atom<TPanelFormDrafts<TValues>>({});
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const useDraftForm = () => {
    const form = useForm<TValues>({ defaultValues: SAVED });
    usePanelFormDraft({
      form,
      recordKey: RECORD,
      values: SAVED,
      draftsState,
    });
    return form;
  };
  return { store, draftsState, wrapper, useDraftForm };
};

describe('usePanelFormDraft discard', () => {
  it('keeps an unsaved edit as a draft across remounts', () => {
    const { store, draftsState, wrapper, useDraftForm } = setup();
    const first = renderHook(useDraftForm, { wrapper });

    act(() => {
      first.result.current.setValue('name', 'Sales', { shouldDirty: true });
    });
    expect(store.get(draftsState)[RECORD]?.values.name).toBe('Sales');

    first.unmount();
    const second = renderHook(useDraftForm, { wrapper });
    expect(second.result.current.getValues('name')).toBe('Sales');
  });

  it('drops the draft when the form is reset to the saved values', () => {
    const { store, draftsState, wrapper, useDraftForm } = setup();
    const first = renderHook(useDraftForm, { wrapper });

    act(() => {
      first.result.current.setValue('name', 'Sales', { shouldDirty: true });
    });
    act(() => {
      first.result.current.reset(SAVED);
    });
    expect(store.get(draftsState)[RECORD]).toBeUndefined();

    first.unmount();
    const second = renderHook(useDraftForm, { wrapper });
    expect(second.result.current.getValues()).toEqual(SAVED);
    expect(second.result.current.formState.isDirty).toBe(false);
  });
});
