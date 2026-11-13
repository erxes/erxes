import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner, useToast } from 'erxes-ui';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { UserAvatar } from '~/components/UserAvatar';
import { messageOf, orpc } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { ONBOARDING_NS } from '../i18n';
import { Appear, EASE_OUT_QUAD } from './Appear';

const getProfileFormSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    avatar: z.union([
      z.literal(''),
      z
        .string()
        .trim()
        .pipe(z.url(t('invalid-url')).max(1000)),
    ]),
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

const TextField = ({
  name,
  label,
}: {
  name: 'firstName' | 'lastName' | 'username';
  label: string;
}) => {
  const { control } = useFormContext<ProfileFormType>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Input type="text" placeholder={label} {...field} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** The picture's URL beside a preview of the avatar it gives. */
const AvatarField = () => {
  const { t } = useTranslation(ONBOARDING_NS);
  const { user } = useSession();
  const { control } = useFormContext<ProfileFormType>();

  const [avatar, firstName, lastName] = useWatch({
    control,
    name: ['avatar', 'firstName', 'lastName'],
  });

  const name = [firstName, lastName].filter(Boolean).join(' ') || user.email;

  return (
    <Form.Field
      control={control}
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
              <Form.Label>{t('avatar-url')}</Form.Label>
              <Form.Control>
                <Input type="url" placeholder="https://" {...field} />
              </Form.Control>
              <Form.Description className="text-xs">{t('avatar-url-description')}</Form.Description>
              <Form.Message />
            </div>
          </div>
        </Form.Item>
      )}
    />
  );
};

/** Saves the profile on the member and in the session, then moves on. */
const useProfileSave = (onContinue: () => void) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const { user } = useSession();
  const client = useQueryClient();
  const { toast } = useToast();

  const update = useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: (updated) => {
        // The top bar and greeting read the session, so they show the new name
        client.setQueryData(orpc.auth.me.queryKey(), (current) =>
          current ? { ...current, user: updated } : current,
        );
        onContinue();
      },
      onError: (error) =>
        toast({
          title: t('error-updating-user'),
          description: messageOf(error),
          variant: 'destructive',
        }),
    }),
  );

  const save = (data: ProfileFormType) =>
    update.mutate({
      id: user.id,
      username: data.username,
      fullName: `${data.firstName} ${data.lastName}`,
      avatarUrl: data.avatar || null,
    });

  return { save, saving: update.isPending };
};

export const ProfileSection = ({ onContinue }: { onContinue: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const { t: tOnboarding } = useTranslation(ONBOARDING_NS);
  const { user } = useSession();
  const { save, saving } = useProfileSave(onContinue);

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(getProfileFormSchema(tOnboarding)),
    defaultValues: {
      ...splitName(user.fullName),
      avatar: user.avatarUrl ?? '',
      username: user.username ?? '',
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
          <form onSubmit={(event) => void form.handleSubmit(save)(event)} className="grid gap-3">
            <AvatarField />
            <div className="grid grid-cols-2 gap-3">
              <TextField name="firstName" label={t('first-name')} />
              <TextField name="lastName" label={t('last-name')} />
            </div>
            <TextField name="username" label={t('username')} />
            <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {t('continue')}
            </Button>
          </form>
        </Form>
      </Appear>
    </Appear>
  );
};
