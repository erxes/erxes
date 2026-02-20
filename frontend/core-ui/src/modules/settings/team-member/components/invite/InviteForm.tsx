import {
  Button,
  Spinner,
  useToast,
  Input,
  Badge,
  TextOverflowTooltip,
  cn,
} from 'erxes-ui';
import { useCallback, useState } from 'react';
import { IconSend, IconX } from '@tabler/icons-react';
import { useUsersInvite } from '@/settings/team-member/hooks/useUsersInvite';
import { z } from 'zod';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

const emailSchema = z.string().email();

export function InviteForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { handleInvitations, loading } = useUsersInvite();
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });
  const addTag = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return;

    const validation = emailSchema.safeParse(trimmedValue);
    if (!validation.success) {
      setError('Please enter a valid email address');
      return;
    }

    if (tags.includes(trimmedValue)) {
      setError('This email has already been added');
      return;
    }

    setTags([...tags, trimmedValue]);
    setInputValue('');
    setError('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError('');

    if (value.endsWith(',') || value.endsWith(' ')) {
      addTag(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
  };

  const submitHandler = useCallback(async () => {
    const validation = emailSchema.safeParse(inputValue);

    if (tags.length === 0 && !validation.success) {
      toast({
        title: 'Please add at least one email address',
        variant: 'destructive',
      });
      return;
    }

    handleInvitations({
      variables: {
        entries: [
          ...tags.map((tag) => ({
            email: tag,
          })),
          ...(validation.success ? [{ email: inputValue }] : []),
        ],
      },
      onCompleted() {
        toast({ title: 'Invitation has been sent', variant: 'success' });
        setIsOpen(false);
      },
      onError(e: ApolloError) {
        toast({
          title: 'Failed to send invitation',
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  }, [handleInvitations, setIsOpen, toast, tags, inputValue]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            name="email"
            placeholder="Enter email addresses"
            value={inputValue}
            autoFocus
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(error && 'focus-visible:shadow-focus-destructive')}
          />
          {error && <p className="text-sm text-destructive mt-1.5">{error}</p>}
          {!error && (
            <p className="text-sm text-muted-foreground mt-1.5">
              {t('separate-emails')}
            </p>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1.5 pr-1.5 max-w-full"
              >
                <TextOverflowTooltip value={tag} className="truncate" />
                <button
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
      <div className="w-full flex gap-3 justify-end">
        <Button onClick={submitHandler} disabled={loading} className="text-sm">
          {(loading && <Spinner size={'sm'} className="stroke-white" />) || (
            <IconSend size={16} />
          )}
          {t('send-invites')}
        </Button>
      </div>
    </div>
  );
}
