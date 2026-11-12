import type { Session } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { UserAvatar } from '~/components/UserAvatar';
import { api, messageOf } from '~/lib/api';
import { SESSION_KEY, useSession } from '~/modules/auth/session';
import { ONBOARDING_NS } from '../i18n';
import { Appear, EASE_OUT_QUAD } from './Appear';

/*
 * Old erxes also set a password here for users invited without one. The new
 * core signs in with a password from the start and has no password change
 * API yet, so this step sets only the name, username and avatar.
 */
const getProfileFormSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    avatar: z.union([z.literal(''), z.string().trim().url(t('invalid-url')).max(1000)]),
    username: z
      .string()
      .trim()
      .min(2, 'Username is required')
      .max(60)
      .regex(/^[a-zA-Z0-9._-]+$/, t('username-format')),
  });

type ProfileFormType = z.infer<ReturnType<typeof getProfileFormSchema>>;

const splitName = (fullName: string | null) => {
  const [firstName = '', ...rest] = (fullName ?? '').trim().split(/\s+/);

  return { firstName, lastName: rest.join(' ') };
};

export const ProfileSection = ({ onContinue }: { onContinue: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const { t: tOnboarding } = useTranslation(ONBOARDING_NS);
  const session = useSession();
  const { user } = session;
  const client = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(getProfileFormSchema(tOnboarding)),
    defaultValues: {
      ...splitName(user.fullName),
      avatar: user.avatarUrl ?? '',
      username: user.username ?? '',
    },
  });

  const avatar = form.watch('avatar');

  const name =
    [form.watch('firstName'), form.watch('lastName')].filter(Boolean).join(' ') || user.email;

  const update = useMutation({
    mutationFn: (data: ProfileFormType) =>
      api.users.update({
        id: user.id,
        username: data.username,
        fullName: `${data.firstName} ${data.lastName}`,
        avatarUrl: data.avatar || null,
      }),
    onSuccess: (updated) => {
      // The top bar and greeting read the session, so they show the new name
      client.setQueryData<Session | null>(SESSION_KEY, (current) =>
        current ? { ...current, user: updated } : current,
      );
      onContinue();
    },
    onError: (error) => {
      toast({
        title: t('error-updating-user'),
        description: messageOf(error),
        variant: 'destructive',
      });
    },
  });

  return (
    <Appear
      y={50}
      duration={600}
      easing={EASE_OUT_QUAD}
      className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background h-fit max-sm:mx-2 sm:min-w-md"
    >
      <Appear y={20} duration={500} delay={200} className="flex flex-col gap-2 text-center mb-2">
        <h2 className="text-2xl font-semibold text-foreground">{t('create-profile')}</h2>
        <p className="text-sm text-muted-foreground">{t('profile-description-username')}</p>
      </Appear>
      <Appear y={20} duration={400} delay={300}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => update.mutate(data))} className="grid gap-3">
            <Form.Field
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <Form.Item className="mb-2">
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      name={name}
                      src={avatar}
                      className="size-16 shrink-0 rounded-lg text-base"
                    />
                    <div className="flex flex-col gap-2 flex-1">
                      <Form.Label>{tOnboarding('avatar-url')}</Form.Label>
                      <Form.Control>
                        <Input type="url" placeholder="https://" {...field} />
                      </Form.Control>
                      <Form.Description className="text-xs">
                        {tOnboarding('avatar-url-description')}
                      </Form.Description>
                      <Form.Message />
                    </div>
                  </div>
                </Form.Item>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('first-name')}</Form.Label>
                    <Form.Control>
                      <Input type="text" placeholder={t('first-name')} autoFocus {...field} />
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
                    <Form.Label>{t('last-name')}</Form.Label>
                    <Form.Control>
                      <Input type="text" placeholder={t('last-name')} {...field} />
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
                  <Form.Label>{t('username')}</Form.Label>
                  <Form.Control>
                    <Input type="text" placeholder={t('username')} {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="submit"
              className="w-full cursor-pointer"
              size="lg"
              disabled={update.isPending}
            >
              {update.isPending && <Spinner size="sm" />}
              {t('continue')}
            </Button>
          </form>
        </Form>
      </Appear>
    </Appear>
  );
};
