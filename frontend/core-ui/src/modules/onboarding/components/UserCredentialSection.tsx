import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { currentUserState } from 'ui-modules';
import { useAtom } from 'jotai';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';

const userCredentialFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters long')
      .regex(/\d/, 'At least one number')
      .regex(/[a-z]/, 'At least one lowercase letter')
      .regex(/[A-Z]/, 'At least one uppercase letter'),
    passwordConfirmation: z.string(),
    username: z.string().min(1, 'Username is required'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'],
  });

type UserCredentialFormType = z.infer<typeof userCredentialFormSchema>;

export const UserCredentialSection = ({
  onContinue,
}: {
  onContinue: () => void;
}) => {
  const [currentUser] = useAtom(currentUserState);
  const form = useForm<UserCredentialFormType>({
    resolver: zodResolver(userCredentialFormSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
      username: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const { usersEdit } = useUserEdit();
  const submitHandler = (data: UserCredentialFormType) => {
    // confirmInvitation({
    //   variables: {
    //     password: data.password,
    //     username: data.username,
    //   },
    // });
    usersEdit({
      variables: {
        _id: currentUser?._id,
        password: data.password,
        username: data.username,
      },
      onCompleted: () => {
        onContinue();
      },
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background h-fit max-sm:mx-2 sm:min-w-sm "
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-2 text-center mb-2"
      >
        <h2 className="text-2xl font-semibold text-foreground">
          Set up your account
        </h2>
        <p className="text-sm text-muted-foreground">
          Create your username and password to get started
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className=" grid gap-3"
          >
            <Form.Field
              name="username"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <Input
                      type="text"
                      placeholder="Enter username"
                      autoFocus
                      {...field}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="password"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="peer"
                        {...field}
                      />
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        size="icon"
                        variant="ghost"
                        tabIndex={-1}
                        className="absolute right-1 top-1/2 -translate-y-1/2 peer-focus:opacity-100 peer-hover:opacity-100 hover:opacity-100 opacity-0"
                      >
                        {showPassword ? (
                          <IconEyeClosed className="text-accent-foreground/70 size-4" />
                        ) : (
                          <IconEye className="text-accent-foreground/70 size-4" />
                        )}
                      </Button>
                    </div>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="passwordConfirmation"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <div className="relative">
                      <Input
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        placeholder="Confirm password"
                        className="peer"
                        {...field}
                      />
                      <Button
                        onClick={() =>
                          setShowPasswordConfirmation(!showPasswordConfirmation)
                        }
                        variant="ghost"
                        size="icon"
                        tabIndex={-1}
                        className="absolute right-1 top-1/2 -translate-y-1/2 peer-focus:opacity-100 peer-hover:opacity-100 hover:opacity-100 opacity-0"
                      >
                        {showPasswordConfirmation ? (
                          <IconEyeClosed className="text-accent-foreground/70 size-4" />
                        ) : (
                          <IconEye className="text-accent-foreground/70 size-4" />
                        )}
                      </Button>
                    </div>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Button type="submit" className="w-full cursor-pointer" size="lg">
              Invite
            </Button>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
};
