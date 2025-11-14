import { motion } from 'framer-motion';
import { Button } from 'erxes-ui';
import { Input, Badge, TextOverflowTooltip, cn } from 'erxes-ui';
import { useState } from 'react';
import { z } from 'zod';
import { IconX } from '@tabler/icons-react';
import { useUsersInvite } from '@/settings/team-member/hooks/useUsersInvite';
const emailSchema = z.string().email();
export const InviteTeamMemberSection = ({
  onContinue,
}: {
  onContinue: () => void;
}) => {
  const { handleInvitations } = useUsersInvite();
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const onClick = () => {
    const trimmed = inputValue.trim();
    const emails = [...tags];

    if (trimmed) {
      const validation = emailSchema.safeParse(trimmed);
      if (!validation.success) {
        setError('Please enter a valid email address');
        return;
      }
      if (emails.includes(trimmed)) {
        setError('This email has already been added');
        return;
      }
      emails.push(trimmed);
    }

    if (emails.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    handleInvitations({
      variables: {
        entries: emails.map((email) => ({ email })),
      },
    });
    setInputValue('');
    setError('');
    onContinue();
  };
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
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="grid gap-5 shadow-sm px-5 pt-7 pb-10 rounded-2xl bg-background max-sm:mx-2 w-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-2 text-center mb-2"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Invite team members
          </h2>
          <p className="text-sm text-muted-foreground">
            Add multiple email addresses to invite your team
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid gap-3"
        >
          <div className="flex flex-col gap-3 overflow-hidden ">
            <div className="w-full p-1">
              <Input
                name="email"
                placeholder="Enter email addresses"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={cn(
                  error && 'focus-visible:shadow-focus-destructive',
                )}
              />
              {error && (
                <p className="text-sm text-destructive mt-1.5">{error}</p>
              )}
              {!error && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  Separate emails with comma, space, or enter
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
          <Button onClick={onClick} className="w-full cursor-pointer" size="lg">
            Continue
          </Button>
        </motion.div>
      </motion.div>
      <span
        className="absolute bottom-1/4 text-accent-foreground hover:text-foreground cursor-pointer"
        onClick={() => onContinue()}
      >
        I'll do this later
      </span>
    </>
  );
};
