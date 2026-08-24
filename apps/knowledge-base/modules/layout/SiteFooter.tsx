import Link from 'next/link';
import { Icon } from '@/modules/ui/Icon';
import { navItems } from './site';

export const SiteFooter = ({ title }: { title: string }) => (
  <footer className="mt-auto border-t border-line bg-subtle px-4 py-10 sm:px-6">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xl font-semibold lowercase tracking-tight text-ink">
          er<span className="text-brand">x</span>es
        </p>
        <p className="mt-2 max-w-xs text-sm text-muted">
          {title} — erxes дэмжлэгийн портал.
        </p>
      </div>

      <nav className="flex flex-col gap-2.5 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted transition-colors hover:text-brand"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/tickets/new"
          className="text-muted transition-colors hover:text-brand"
        >
          Шинэ хүсэлт
        </Link>
      </nav>

      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon name="language" size={18} />
        Монгол
      </div>
    </div>

    <p className="mx-auto mt-8 w-full max-w-6xl text-[13px] text-muted">
      © {new Date().getFullYear()} erxes. Бүх эрх хамгаалагдсан.
    </p>
  </footer>
);
