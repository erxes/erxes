import { Button, Form, Input } from 'erxes-ui';
import { useLogin } from '@/auth/login/hooks/useLogin';
import { useSignInUpForm } from '@/auth/login/hooks/useLoginForm';
import { Link } from 'react-router-dom';

export const CredentialLoginForm = () => {
  const { form } = useSignInUpForm();
  const { handleCrendentialsLogin } = useLogin();

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
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
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
