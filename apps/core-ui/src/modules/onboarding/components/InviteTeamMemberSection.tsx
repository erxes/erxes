import { IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, cn, Input, TextOverflowTooltip, toast } from 'erxes-ui';
import { type ChangeEvent, type KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '~/lib/api';
import { ONBOARDING_NS } from '../i18n';
import { Appear, EASE_OUT_QUAD } from './Appear';

const emailSchema = z.string().email();

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

export const InviteTeamMemberSection = ({ onContinue }: { onContinue: () => void }) => {
  const inviteEmails = useInviteEmails();
  const { t } = useTranslation('common', { keyPrefix: 'onboarding' });
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const onClick = () => {
    const trimmed = inputValue.trim();
    const emails = [...tags];

    if (trimmed) {
      const validation = emailSchema.safeParse(trimmed);

      if (!validation.success) {
        setError(t('invalid-email'));

        return;
      }

      if (emails.includes(trimmed)) {
        setError(t('email-already-added'));

        return;
      }

      emails.push(trimmed);
    }

    if (emails.length === 0) {
      setError(t('add-at-least-one-email'));

      return;
    }

    // As in old erxes the step moves on while the invitations go out
    inviteEmails.mutate(emails);
    setInputValue('');
    setError('');
    onContinue();
  };

  const addTag = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return;

    const validation = emailSchema.safeParse(trimmedValue);

    if (!validation.success) {
      setError(t('invalid-email'));

      return;
    }

    if (tags.includes(trimmedValue)) {
      setError(t('email-already-added'));

      return;
    }

    setTags([...tags, trimmedValue]);
    setInputValue('');
    setError('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError('');

    if (value.endsWith(',') || value.endsWith(' ')) {
      addTag(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
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
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={cn(error && 'focus-visible:shadow-focus-destructive')}
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
