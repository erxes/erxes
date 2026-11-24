import { orpc } from '@erxes/core-contract/client';
import { IconLifebuoy } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useSession } from '~/modules/auth/session';
import { usePlan } from './usePlan';

/**
 * One line above every page while erxes support is in the workspace (SaaS): the owners see
 * who and until when, with a link to end it; erxes support sees when their visit ends.
 */
export const SupportBanner = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'support' });
  const fmt = useFormat();
  const { user, permissions } = useSession();
  const saas = usePlan().data?.saas;
  const owner = user.role === 'owner';

  const { data } = useQuery(
    orpc.supportAccess.active.queryOptions({
      input: saas && owner ? {} : skipToken,
      refetchInterval: 60_000,
    }),
  );

  const [first] = data?.data ?? [];

  if (!first) return null;

  const until = fmt.time(first.endsAt);

  return (
    <output className="flex shrink-0 items-center gap-2 bg-warning/10 px-4 py-1.5 text-sm text-warning-text">
      <IconLifebuoy className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">
        {user.isSupport
          ? t(
              'banner-self',
              'You’re in as erxes support until {{until}}. Team members, roles, API keys and audit settings are closed to you.',
              { until },
            )
          : t('banner-owner', 'erxes support is in your workspace: {{names}}, until {{until}}.', {
              names: (data?.data ?? []).map((visit) => visit.staffName).join(', '),
              until,
            })}
      </span>
      {permissions.includes('support.manage') && (
        <Link
          to={paths.settings.supportAccess}
          className="shrink-0 font-medium underline underline-offset-2"
        >
          {t('banner-manage', 'See or end the visit')}
        </Link>
      )}
    </output>
  );
};
