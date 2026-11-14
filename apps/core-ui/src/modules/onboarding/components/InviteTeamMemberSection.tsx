import { IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, cn, Input, TextOverflowTooltip, toast } from 'erxes-ui';
import { type ChangeEvent, type KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '~/lib/api';
import { ONBOARDING_NS } from '../i18n';
import { Appear, EASE_OUT_QUAD } from './Appear';

const emailSchema = z.email();

/** Invites each address as a member (one call each); the result arrives as a toast. */
const useInviteEmails = () => {
  const client = useQueryClient();
  const { t } = useTranslation(ONBOARDING_NS);

  return useMutation({
    mutationFn: (emails: string[]) =>
      Promise.all(
        emails.map((email) =>
          orpc.users.invite.call({ email }).then(
            () => ({ email, error: null }),
            (error: unknown) => ({ email, error }),
          ),
        ),
      ),
    onSuccess: (outcomes) => {
      const failed = outcomes.filter((outcome) => outcome.error !== null);
      const sent = outcomes.length - failed.length;
      const [firstFailure] = failed;

      if (sent) {
        toast({ title: t('invite-sent', { count: sent }), variant: 'success' });
      }

      if (firstFailure) {
        toast({
          title: t('invite-failed', { emails: failed.map((outcome) => outcome.email).join(', ') }),
          description: messageOf(firstFailure.error),
          variant: 'destructive',
        });
      }

      return client.invalidateQueries({ queryKey: orpc.users.key() });
    },
  });
};

/** Emails typed one by one: each is checked, then kept as a tag. */
const useEmailTags = () => {
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  /** Why `email` cannot be added, if it cannot. */
  const problemWith = (email: string) => {
    if (!emailSchema.safeParse(email).success) return t('invalid-email');

    return tags.includes(email) ? t('email-already-added') : null;
  };

  const addTag = (value: string) => {
    const email = value.trim();

    if (!email) return;

    const problem = problemWith(email);

    setError(problem ?? '');

    if (problem) return;

    setTags([...tags, email]);
    setInputValue('');
  };

  /** The tags and what is still typed, or null with the reason shown. */
  const collect = () => {
    const typed = inputValue.trim();
    const problem = typed ? problemWith(typed) : null;
    const emails = typed ? [...tags, typed] : tags;

    if (problem || !emails.length) {
      setError(problem ?? t('add-at-least-one-email'));

      return null;
    }

    setInputValue('');
    setError('');

    return emails;
  };

  return {
    tags,
    inputValue,
    error,
    collect,
    removeTag: (email: string) => setTags(tags.filter((tag) => tag !== email)),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === ',' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        addTag(inputValue);
      }
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setError('');

      if (value.endsWith(',') || value.endsWith(' ')) addTag(value.slice(0, -1));
      else setInputValue(value);
    },
  };
};

export const InviteTeamMemberSection = ({ onContinue }: { onContinue: () => void }) => {
  const inviteEmails = useInviteEmails();
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const { tags, inputValue, error, collect, removeTag, onKeyDown, onChange } = useEmailTags();

  const onClick = () => {
    const emails = collect();

    if (!emails) return;

    // The step moves on while the invitations go out.
    inviteEmails.mutate(emails);
    onContinue();
  };

  return (
    <>
      <Appear
        y={50}
        duration={600}
        easing={EASE_OUT_QUAD}
        className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background max-sm:mx-2 w-sm"
      >
        <Appear y={20} duration={500} delay={200} className="flex flex-col gap-2 text-center mb-2">
          <h2 className="text-2xl font-semibold text-foreground">{t('invite-team-members')}</h2>
          <p className="text-sm text-muted-foreground">{t('invite-description')}</p>
        </Appear>
        <Appear y={20} duration={400} delay={300} className="grid gap-3">
          <div className="flex flex-col gap-3 overflow-hidden ">
            <div className="w-full p-1">
              <Input
                name="email"
                placeholder={t('enter-email-addresses')}
                value={inputValue}
                onChange={onChange}
                onKeyDown={onKeyDown}
                aria-invalid={!!error}
              />
              {error && <p className="text-sm text-destructive mt-1.5">{error}</p>}
              {!error && (
                <p className="text-sm text-muted-foreground mt-1.5">{t('separate-emails')}</p>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1.5 pr-1.5 max-w-full">
                    <TextOverflowTooltip value={tag} className="truncate" />
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={t('remove-email', { email: tag })}
                      className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 shrink-0"
                    >
                      <IconX className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button onClick={onClick} className="w-full cursor-pointer" size="lg">
            {t('continue')}
          </Button>
        </Appear>
      </Appear>
      <button
        type="button"
        className="absolute bottom-1/4 text-accent-foreground hover:text-foreground cursor-pointer"
        onClick={() => onContinue()}
      >
        {t('do-this-later')}
      </button>
    </>
  );
};
