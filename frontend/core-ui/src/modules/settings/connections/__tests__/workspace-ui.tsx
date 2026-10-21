import type { PropsWithChildren } from 'react';

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
