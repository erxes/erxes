import { Button } from 'erxes-ui';

import { GoogleLogo } from '@/auth/components/GoogleLogo';
import { useTranslation } from 'react-i18next';
export const GoogleOAuthButton = () => {
  const { t } = useTranslation('auth');
  const handleClick = () => {
    // handle gmail login
  };
  return (
    <Button
      variant={'outline'}
      className="flex shadow-sm h-8"
      onClick={handleClick}
    >
      <GoogleLogo />
      <span className="text-sm font-semibold">{t('continue-with-google', 'Continue with Google')}</span>
    </Button>
  );
};
