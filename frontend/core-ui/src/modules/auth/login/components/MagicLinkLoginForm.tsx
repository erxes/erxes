import { useLoginMagicLink } from '@/auth/login/hooks/useLoginMagicLink';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { Button, Form, Input, Label } from 'erxes-ui';

export const MagicLinkLoginForm = () => {
  const { form, onMagicLinkSubmit, onGoogleLogin } = useLoginMagicLink();

  return (
    <Form {...form}>
      <form onSubmit={onMagicLinkSubmit} className="mx-auto grid gap-5">
        <div className="text-center text-sm text-accent-foreground">
          We use magic link so you don't have to remember or type in yet another
          long password
        </div>
        <Form.Field
          name="email"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Email
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Button type="submit" className="h-8">
          Continue
        </Button>
        <Label className="text-center">OR</Label>
        <Button variant="secondary" onClick={onGoogleLogin} type="button">
          <IconBrandGoogleFilled />
          Continue with Google
        </Button>
      </form>
    </Form>
  );
};
