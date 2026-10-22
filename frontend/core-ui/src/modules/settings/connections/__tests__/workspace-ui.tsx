import type { PropsWithChildren } from 'react';
import { atom } from 'jotai';

export const pluginsConfigState = atom<Record<string, { name: string }> | null>(
  {
    frontline_ui: { name: 'frontline' },
    sales_ui: { name: 'sales' },
  },
);

export const usePermissionCheck = jest.fn(() => ({
  isLoaded: true,
  hasActionPermission: (action: string) => action.length > 0,
}));

export function PageHeader({ children }: PropsWithChildren) {
  return <header>{children}</header>;
}
export function PageHeaderStart({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
export function PageHeaderEnd({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
