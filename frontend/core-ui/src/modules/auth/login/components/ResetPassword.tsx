import { SubmitHandler } from 'react-hook-form';

import { Button, Form, Input } from 'erxes-ui';

import { useLogin } from '@/auth/login/hooks/useLogin';
import {
  ResetPasswordFormType,
  useResetPasswordForm,
} from '@/auth/login/hooks/useLoginForm';

export const ResetPassword = ({ token }: { token: string }) => {
  const { form } = useResetPasswordForm();

  const { handleResetPassword } = useLogin();

  const submitHandler: SubmitHandler<ResetPasswordFormType> = (data) => {
    handleResetPassword(token, data.password);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="mx-auto grid w-[350px] gap-5"
      >
        <Form.Field
          name="password"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="confirmPassword"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Button type="submit" onClick={form.handleSubmit(submitHandler)}>
          Change password
        </Button>
      </form>
    </Form>
  );
};
