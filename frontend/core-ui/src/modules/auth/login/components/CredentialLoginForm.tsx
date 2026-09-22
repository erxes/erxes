import { Button, Form, Input } from 'erxes-ui';
import { useLogin } from '@/auth/login/hooks/useLogin';
import { useSignInUpForm } from '@/auth/login/hooks/useLoginForm';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const PASSWORD_REVEAL_TIMEOUT = 10000;

export const CredentialLoginForm = () => {
  const { form } = useSignInUpForm();
  const { handleCrendentialsLogin } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!showPassword) return;
    const timer = setTimeout(
      () => setShowPassword(false),
      PASSWORD_REVEAL_TIMEOUT,
    );
    return () => clearTimeout(timer);
  }, [showPassword]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => handleCrendentialsLogin(data))}
        className="mx-auto grid gap-6"
      >
        <Form.Field
          name="email"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Email or Username
              </Form.Label>
              <Form.Control>
                <Input
                  autoFocus
                  type="text"
                  placeholder="Enter your work email or username"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="password"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Password
              </Form.Label>
              <Form.Control>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pr-9"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute inset-y-0 right-1 my-auto size-6 rounded-sm p-0 text-accent-foreground/60 hover:text-foreground"
                  >
                    {showPassword ? (
                      <IconEyeOff size={15} stroke={1.75} />
                    ) : (
                      <IconEye size={15} stroke={1.75} />
                    )}
                  </Button>
                </div>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" className="h-8">
          Sign in
        </Button>

        <Button
          type="button"
          variant="link"
          asChild
          className="flex text-foreground hover:bg-transparent"
        >
          <Link
            to={(() => {
              const email = form.getValues('email');
              return `/forgot-password${
                email ? `?email=${encodeURIComponent(email)}` : ''
              }`;
            })()}
          >
            Forgot password?
          </Link>
        </Button>
      </form>
    </Form>
  );
};
