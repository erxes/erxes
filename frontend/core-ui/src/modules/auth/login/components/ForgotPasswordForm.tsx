import { Button, Form, Input } from 'erxes-ui';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/auth/login/hooks/useLogin';
import { useQueryState } from 'erxes-ui';
import { useEffect, useRef } from 'react';

export const ForgotPasswordForm = () => {
  const { handleForgotPassword } = useLogin();
  const [email, setEmail] = useQueryState('email');
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const ForgotPasswordFormValidation = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
  });

  const form = useForm<z.infer<typeof ForgotPasswordFormValidation>>({
    resolver: zodResolver(ForgotPasswordFormValidation),
    defaultValues: { email: (email as string) || '' },
  });

  const submitHandler: SubmitHandler<
    z.infer<typeof ForgotPasswordFormValidation>
  > = (data) => {
    handleForgotPassword(data.email);
    setEmail(null);
  };
  useEffect(() => {
    if (emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 0);
    }
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="mx-auto grid gap-5"
      >
        <Form.Field
          name="email"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Email
              </Form.Label>
              <Form.Control>
                <Input
                  placeholder="Enter your work email"
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    emailInputRef.current = e;
                  }}
                  value={field.value || ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Button type="submit" className={`h-8`}>
          Sign in
        </Button>
      </form>
    </Form>
  );
};
