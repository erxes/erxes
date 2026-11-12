import { IconUserCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { orpc } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { ProfileForm } from './ProfileForm';

/** Settings › Profile: the signed-in member's own details (password and sign-ins: Password & security). */
export const ProfileSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { user } = useSession();
  const profile = useQuery(orpc.users.get.queryOptions({ input: { id: user.id } }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Profile'), to: '/settings/profile', icon: IconUserCircle },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          <QueryState query={profile} className="py-12">
            {/* A newer profile (saved here or elsewhere) starts the form again from it. */}
            {(data) => <ProfileForm key={data.updatedAt} user={data} />}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
