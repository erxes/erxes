import { Button, Form, Input, Upload, useToast } from 'erxes-ui';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

import type { Control } from 'react-hook-form';
import { currentUserState } from 'ui-modules';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters long')
  .regex(/\d/, 'At least one number')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[A-Z]/, 'At least one uppercase letter');

const getProfileFormSchema = (requirePassword: boolean) =>
  z
    .object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      avatar: z.string().optional(),
      username: z.string().min(1, 'Username is required'),
      password: requirePassword ? passwordSchema : z.string(),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords don't match",
      path: ['passwordConfirmation'],
    });

type ProfileFormType = z.infer<ReturnType<typeof getProfileFormSchema>>;

const PasswordField = ({
  control,
  name,
  placeholder,
}: {
  control: Control<ProfileFormType>;
  name: 'password' | 'passwordConfirmation';
  placeholder: string;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{placeholder}</Form.Label>
          <Form.Control>
            <div className="relative">
              <Input
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                className="peer"
                {...field}
              />
              <Button
                type="button"
                onClick={() => setVisible(!visible)}
                size="icon"
                variant="ghost"
                tabIndex={-1}
                className="absolute right-1 top-1/2 -translate-y-1/2 peer-focus:opacity-100 peer-hover:opacity-100 hover:opacity-100 opacity-0"
              >
                {visible ? (
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
  );
};

export const ProfileSection = ({ onContinue }: { onContinue: () => void }) => {
  const [currentUser] = useAtom(currentUserState);
  const hasPassword = !!currentUser?.hasPassword;
  const { usersEdit } = useUserEdit();
  const { toast } = useToast();
  const form = useForm<ProfileFormType>({
    resolver: zodResolver(getProfileFormSchema(!hasPassword)),
    defaultValues: {
      firstName: currentUser?.details?.firstName || '',
      lastName: currentUser?.details?.lastName || '',
      avatar: currentUser?.details?.avatar || undefined,
      username: currentUser?.username || '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const submitHandler = (data: ProfileFormType) => {
    usersEdit({
      variables: {
        _id: currentUser?._id,
        username: data.username,
        ...(!hasPassword && { password: data.password }),
        details: {
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`,
          avatar: data.avatar,
        },
      },
      onCompleted: () => {
        onContinue();
      },
      onError: (error) => {
        toast({
          title: 'Error updating user',
          description: error.message,
          variant: 'destructive',
        });
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
      className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background h-fit max-sm:mx-2 sm:min-w-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-2 text-center mb-2"
      >
        <h2 className="text-2xl font-semibold text-foreground">
          Create your profile
        </h2>
        <p className="text-sm text-muted-foreground">
          {hasPassword
            ? 'Add your details and pick a username'
            : 'Add your details and secure your account'}
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
            className="grid gap-3"
          >
            <Form.Field
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <Form.Item className="mb-2">
                  <Form.Control>
                    <div className="flex items-start gap-4">
                      <Upload.Root
                        value={field.value ?? ''}
                        onChange={(fileInfo) => {
                          if (
                            typeof fileInfo === 'object' &&
                            'url' in fileInfo
                          ) {
                            field.onChange(fileInfo.url);
                          }
                        }}
                      >
                        <Upload.Preview className="shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex gap-2">
                            <Upload.Button
                              size="sm"
                              variant="outline"
                              type="button"
                            />
                            <Upload.RemoveButton
                              size="sm"
                              variant="outline"
                              type="button"
                            />
                          </div>
                          <Form.Description className="text-xs">
                            Upload a profile picture to help identify you.
                          </Form.Description>
                        </div>
                      </Upload.Root>
                    </div>
                  </Form.Control>
                </Form.Item>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>First name</Form.Label>
                    <Form.Control>
                      <Input
                        type="text"
                        placeholder="First name"
                        autoFocus
                        {...field}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Last name</Form.Label>
                    <Form.Control>
                      <Input type="text" placeholder="Last name" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
            <Form.Field
              name="username"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Username</Form.Label>
                  <Form.Control>
                    <Input type="text" placeholder="Username" {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            {!hasPassword && (
              <>
                <PasswordField
                  control={form.control}
                  name="password"
                  placeholder="Password"
                />
                <PasswordField
                  control={form.control}
                  name="passwordConfirmation"
                  placeholder="Confirm password"
                />
              </>
            )}
            <Button type="submit" className="w-full cursor-pointer" size="lg">
              Continue
            </Button>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
};
