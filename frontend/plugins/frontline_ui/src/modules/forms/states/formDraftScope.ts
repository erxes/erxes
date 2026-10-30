import { atom } from 'jotai';
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils';

export const formDraftScopeAtom = atom('unscoped');

// Session storage belongs to one browser tab. A form gets its own draft inside
// that tab; previews receive a copy through their editor's explicit channel.
export const formDraftAtom = <Value>(name: string, initialValue: Value) => {
  const drafts = atomFamily((scope: string) =>
    scope.startsWith('preview:')
      ? atom(initialValue)
      : atomWithStorage(
          `frontline-form:${scope}:${name}`,
          initialValue,
          createJSONStorage<Value>(() => sessionStorage),
          { getOnInit: true },
        ),
  );

  return atom(
    (get) => get(drafts(get(formDraftScopeAtom))),
    (get, set, update: Value | ((previous: Value) => Value)) => {
      set(drafts(get(formDraftScopeAtom)), update);
    },
  );
};
