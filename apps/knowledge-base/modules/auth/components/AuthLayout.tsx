import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthPattern } from './AuthPattern';

const Wordmark = ({ className }: { className?: string }) => (
  <span className={className}>
    er<span className="text-brand">x</span>es
  </span>
);

export const AuthLayout = ({
  title,
  subtitle,
  headline,
  blurb,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  headline: string;
  blurb: string;
  footer: ReactNode;
  children: ReactNode;
}) => (
  <div className="grid flex-1 lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden bg-ink px-14 py-12 text-white lg:flex lg:flex-col">
      <AuthPattern className="text-white/[0.07]" />
      <Link
        href="/"
        className="relative self-center text-xl font-semibold lowercase tracking-tight text-white transition-opacity hover:opacity-80"
      >
        er<span className="text-white/60">x</span>es
      </Link>

      <div className="relative mt-auto max-w-md">
        <h2 className="text-[28px] font-semibold leading-tight text-balance">
          {headline}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/55">{blurb}</p>
      </div>
    </aside>

    <div className="relative flex items-center justify-center overflow-hidden bg-subtle px-5 py-14">
      <AuthPattern className="text-brand/[0.06]" />

      <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative w-full max-w-[25rem] duration-500">
        <Link
          href="/"
          className="block text-center text-xl font-semibold lowercase tracking-tight text-ink transition-colors hover:text-brand"
        >
          <Wordmark />
        </Link>

        <div className="mt-8 rounded-2xl border border-line bg-white p-7 shadow-[0_16px_40px_rgba(23,22,42,0.08)] sm:p-8">
          <h1 className="text-center text-xl font-semibold text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-center text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  </div>
);
