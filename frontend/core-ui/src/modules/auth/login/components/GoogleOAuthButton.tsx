import { Button } from 'erxes-ui';

import { GoogleLogo } from '@/auth/components/GoogleLogo';
export const GoogleOAuthButton = () => {
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
      <span className="text-sm font-semibold">Continue with google</span>
    </Button>
  );
};
