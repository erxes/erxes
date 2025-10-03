import { Button } from 'erxes-ui';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Link } from 'react-router-dom';
import { AppPath } from '@/types/paths/AppPath';
export const ForgotPassword = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="font-semibold text-lg leading-none">
          Forgot password?
        </div>
        <div className="text-center text-sm text-accent-foreground">
          Please enter your email address below to receive a password reset link
        </div>
      </div>
      <ForgotPasswordForm />
      <Button
        type="button"
        variant="link"
        asChild
        className="flex text-foreground hover:bg-transparent"
      >
        <Link to={AppPath.Login}>Login</Link>
      </Button>
    </>
  );
};
