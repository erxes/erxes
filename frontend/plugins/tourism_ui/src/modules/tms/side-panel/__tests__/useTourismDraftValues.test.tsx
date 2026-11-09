import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  tourismDraftValuesState,
  useClearTourismDraftValues,
  useTourismDraftValues,
} from '../useTourismDraftValues';

const CONTENT_TYPE = 'tourism:tmsTour';

interface IDraftValues {
  name: string;
}

type TStore = ReturnType<typeof createStore>;

const createWrapper =
  (store: TStore) =>
  ({ children }: { children: ReactNode }) =>
    <Provider store={store}>{children}</Provider>;

const renderDraftForm = (store: TStore, isNew = true) =>
  renderHook(
    () => {
      const form = useForm<IDraftValues>({ defaultValues: { name: '' } });
      useTourismDraftValues(CONTENT_TYPE, form, isNew);
      return form;
    },
    { wrapper: createWrapper(store) },
  );

describe('useTourismDraftValues', () => {
  it('restores saved values into a new form', () => {
    const store = createStore();
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: { name: 'Saved' } });

    const { result } = renderDraftForm(store);

    expect(result.current.getValues('name')).toBe('Saved');
  });

  it('keeps typed values for the content type', () => {
    const store = createStore();
    const { result } = renderDraftForm(store);

    act(() => {
      result.current.setValue('name', 'Typed');
    });

    expect(store.get(tourismDraftValuesState)[CONTENT_TYPE]).toEqual({
      name: 'Typed',
    });
  });

  it('does not restore values after they are cleared', () => {
    const store = createStore();
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: { name: 'Saved' } });

    const { result: clear } = renderHook(() => useClearTourismDraftValues(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      clear.current(CONTENT_TYPE);
    });

    const { result } = renderDraftForm(store);

    expect(result.current.getValues('name')).toBe('');
  });

  it('leaves saved records untouched', () => {
    const store = createStore();
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: { name: 'Saved' } });

    const { result } = renderDraftForm(store, false);

    expect(result.current.getValues('name')).toBe('');
  });
});
