import { createContext, use } from 'react';

export interface UiHost {
  live: boolean;
  press: (label: string) => void;
}

export const UiHostContext = createContext<UiHost>({ live: false, press: () => undefined });

export const useUiHost = () => use(UiHostContext);
