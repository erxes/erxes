import Link from 'next/link';
import type { ReactNode } from 'react';

export const AuthCard = ({
  title,
  subtitle,
  subtitleBrand,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  subtitleBrand: string;
  footer: ReactNode;
  children: ReactNode;
}) => (
  <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
    <div className="text-center">
      <Link
        href="/"
        className="text-2xl font-semibold lowercase tracking-tight text-ink"
      >
        er<span className="text-brand">x</span>es
      </Link>
      <p className="mt-1.5 text-sm text-muted">{subtitleBrand}</p>
    </div>

    <div className="mt-8 rounded-xl border border-line bg-white p-7">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>

      <div className="mt-6">{children}</div>
    </div>

    <p className="mt-6 text-center text-sm text-muted">{footer}</p>
  </div>
);
