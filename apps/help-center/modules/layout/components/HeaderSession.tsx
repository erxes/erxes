'use client';

import Link from 'next/link';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Icon } from '@/modules/ui/components/Icon';

export const HeaderSession = () => {
  const { user, ready, signOut } = useSession();

  if (!ready) {
    return (
      <span className="block h-8 w-36 animate-pulse rounded-lg bg-white/10" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/sign-up"
          className="flex h-8 items-center rounded-lg px-3 text-[13px] font-medium text-white/60 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
        >
          Sign up
        </Link>
        <Link
          href="/sign-in"
          className="flex h-8 items-center rounded-lg bg-white px-3.5 text-[13px] font-semibold text-shell outline-none transition-[background-color,transform] duration-300 ease-out-soft hover:bg-white/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/account"
        className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pl-1 pr-2.5 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/10 focus-visible:bg-white/10"
      >
        <Avatar name={user.name} size={26} />
        <span className="min-w-0 max-w-44 truncate text-[13px] font-medium text-white">
          {user.name}
        </span>
      </Link>

      <button
        type="button"
        aria-label="Sign out"
        onClick={signOut}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
      >
        <Icon name="logout" size={16} />
      </button>
    </div>
  );
};
