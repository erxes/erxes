import { Button, Separator } from 'erxes-ui';
import { IconSandbox } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PUT_RESPONSE_ROUTES } from './PutResponseRoutes';

export const PutResponseBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconSandbox className="w-4 h-4 mr-1.5" />
        {t('put-response')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {t(PUT_RESPONSE_ROUTES.find((r) => pathname.endsWith(r.value))?.label ?? '')}
      </Button>
    </>
  );
};
