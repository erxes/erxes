import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTelegramTranslation } from './translations';

/** Explains per-bot setup and links to personal or team inbox connections. */
export const TelegramConfig = () => {
  const { t } = useTelegramTranslation();

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p>{t('configIntro')}</p>
      <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
        <li>{t('configChooseInbox')}</li>
        <li>{t('configConnect')}</li>
        <li>{t('configManage')}</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/frontline/settings/personal-channel">
            {t('personalInbox')}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/frontline/settings/channels">{t('teamInboxes')}</Link>
        </Button>
      </div>
    </div>
  );
};
