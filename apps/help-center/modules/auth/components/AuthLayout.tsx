import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/modules/ui/components/Icon';

const BENEFITS = [
  'Track every request you raise',
  'Reply to the support team in one thread',
  'Read the articles kept for signed-in users',
];

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
  <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <aside className="relative hidden overflow-hidden bg-shell px-12 py-12 text-white lg:flex lg:flex-col xl:px-16">
      <span
        aria-hidden="true"
        className="animate-aurora pointer-events-none absolute -left-32 -top-40 size-[34rem] rounded-full bg-brand/35 blur-[120px]"
      />
      <span
        aria-hidden="true"
        className="animate-aurora-slow pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-brand/20 blur-[110px]"
      />
      <span
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-0"
      />

      <Link
        href="/"
        className="relative self-start rounded-lg text-xl font-semibold lowercase tracking-tight text-white outline-none transition-opacity duration-300 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/40"
      >
        er<span className="text-white/50">x</span>es
      </Link>

      <div className="relative my-auto max-w-lg py-10">
        <h2 className="text-balance text-[34px] font-semibold leading-[1.15] tracking-[-0.03em]">
          {headline}
        </h2>
        <p className="mt-5 text-pretty text-[15px] leading-relaxed text-white/55">
          {blurb}
        </p>

        <ul className="mt-10 space-y-3.5">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-3 text-[14px] text-white/70"
            >
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <Icon name="check" size={13} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </aside>

    <div className="flex items-center justify-center bg-canvas px-5 py-12 sm:px-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both w-full max-w-[26rem] duration-500">
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-muted-foreground outline-none transition-colors duration-300 ease-out-soft hover:text-brand focus-visible:text-brand"
        >
          <Icon
            name="arrowLeft"
            size={15}
            className="transition-transform duration-300 ease-out-soft group-hover:-translate-x-0.5"
          />
          Back to help center
        </Link>

        <div className="rounded-2xl bg-white p-7 shadow-shell sm:p-8">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
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
