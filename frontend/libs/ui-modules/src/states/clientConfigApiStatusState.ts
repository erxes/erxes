import { atom } from 'jotai';

type ApiStatus = {
  isLoaded: boolean;
  isErrored: boolean;
  error?: Error;
};

export const clientConfigApiStatusState = atom<ApiStatus>({
  isLoaded: false,
  isErrored: false,
  error: undefined,
});
