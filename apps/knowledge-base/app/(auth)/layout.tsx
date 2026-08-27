import type { ReactNode } from 'react';

/** Auth routes take the whole viewport, so they render without site chrome. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
