import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FrontlinePaths } from '@/types/FrontlinePaths';

export const MailSendingRequired = ({ reason }: { reason?: string | null }) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('mail-sending-required-description')}
      </p>

      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-sm font-medium">
          {t('mail-sending-required-cloudflare')}
        </p>
        <p className="text-xs text-muted-foreground">
          {reason || t('mail-sending-required-cloudflare-description')}
        </p>
        <Button variant="secondary" asChild className="w-full">
          <Link
            to={`/settings/${FrontlinePaths.Frontline}${FrontlinePaths.IntegrationConfig}`}
          >
            <IconExternalLink size={16} />
            {t('mail-sending-required-cloudflare-action')}
          </Link>
        </Button>
      </div>
    </div>
  );
};
