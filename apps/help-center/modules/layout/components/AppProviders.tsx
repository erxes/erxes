import type { ReactNode } from 'react';
import { ApolloWrapper } from '@/modules/apollo/components/ApolloWrapper';
import { SessionProvider } from '@/modules/auth/components/SessionProvider';
import { LocaleProvider } from '@/modules/i18n/components/LocaleProvider';
import type { Locale } from '@/modules/i18n/locales';
import { Toaster } from '@/modules/ui/components/Toaster';

export const AppProviders = ({
  locale,
  appToken,
  children,
}: {
  locale: Locale;
  appToken: string;
  children: ReactNode;
}) => (
  <LocaleProvider locale={locale}>
    <ApolloWrapper appToken={appToken}>
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    </ApolloWrapper>
  </LocaleProvider>
);
