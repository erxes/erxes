import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  tourismDraftValuesState,
  useClearTourismDraftValues,
  useTourismDraftValues,
} from '../useTourismDraftValues';

let mockPathname = '';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

const CONTENT_TYPE = 'tourism:tmsTour';
const BRANCH_ID = 'branch-a';
const SAVED_ENTRY = { branchId: BRANCH_ID, values: { name: 'Saved' } };

interface IDraftValues {
  name: string;
}

type TStore = ReturnType<typeof createStore>;

const createWrapper =
  (store: TStore) =>
  ({ children }: { children: ReactNode }) =>
    <Provider store={store}>{children}</Provider>;

const renderDraftForm = (store: TStore, isNew = true, branchId = BRANCH_ID) =>
  renderHook(
    () => {
      mockPathname = `/tourism/tms/branches/${branchId}/records/tmsTour/new`;
      const form = useForm<IDraftValues>({ defaultValues: { name: '' } });
      useTourismDraftValues(CONTENT_TYPE, form, isNew);
      return form;
    },
    { wrapper: createWrapper(store) },
  );

describe('useTourismDraftValues', () => {
  it('restores saved values into a new form of the same branch', () => {
    const store = createStore();
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: SAVED_ENTRY });

    const { result } = renderDraftForm(store);

    expect(result.current.getValues('name')).toBe('Saved');
  });

  it('does not restore values saved in another branch', () => {
    const store = createStore();
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: SAVED_ENTRY });

    const { result } = renderDraftForm(store, true, 'branch-b');

    expect(result.current.getValues('name')).toBe('');
  });

  it('keeps typed values with their branch', () => {
    const store = createStore();
    const { result } = renderDraftForm(store);

    act(() => {
      result.current.setValue('name', 'Typed');
    });

    expect(store.get(tourismDraftValuesState)[CONTENT_TYPE]).toEqual({
      branchId: BRANCH_ID,
      values: { name: 'Typed' },
    });
  });

  it('does not restore values after they are cleared', () => {
    const store = createStore();
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: SAVED_ENTRY });

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
    store.set(tourismDraftValuesState, { [CONTENT_TYPE]: SAVED_ENTRY });

    const { result } = renderDraftForm(store, false);

    expect(result.current.getValues('name')).toBe('');

    act(() => {
      result.current.setValue('name', 'Edited');
    });

    expect(store.get(tourismDraftValuesState)[CONTENT_TYPE]).toEqual(
      SAVED_ENTRY,
    );
  });
});
