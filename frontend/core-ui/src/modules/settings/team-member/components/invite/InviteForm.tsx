import {
  Badge,
  Button,
  Checkbox,
  cn,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextOverflowTooltip,
  useToast,
} from 'erxes-ui';
import { useId, useMemo, useState } from 'react';
import { IconSend, IconX } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApolloError } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState, SelectStructureEntities } from 'ui-modules';
import {
  getStructureSeatCoverageLabel,
  useStructureSeats,
} from '@/structure-access';
import { useUsersInvite } from '@/settings/team-member/hooks/useUsersInvite';
import {
  getInviteFormSchema,
  TInviteForm,
} from '@/settings/team-member/schema/invite';
import { buildInvitationEntries } from '@/settings/team-member/utils/invitationEntries';

const emailSchema = z.string().email();
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const single = (value?: string[] | string) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

const InviteSeatsField = ({
  entityId,
  value,
  onValueChange,
}: {
  entityId: string;
  value: string[];
  onValueChange: (seatIds: string[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: tStructure } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const idPrefix = useId();
  const { seats, loading, error } = useStructureSeats({ entityId });

  const toggle = (seatId: string, checked: boolean) => {
    const rest = value.filter((id) => id !== seatId);

    onValueChange(checked ? [...rest, seatId] : rest);
  };

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (!seats.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('no-seats-at-node')}</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {seats.map((seat) => {
        const inputId = `${idPrefix}-${seat._id}`;

        return (
          <div key={seat._id} className="flex items-start gap-2">
            <Checkbox
              id={inputId}
              checked={value.includes(seat._id)}
              onCheckedChange={(checked) => toggle(seat._id, checked === true)}
            />
            <Label
              variant="peer"
              htmlFor={inputId}
              className="flex flex-col gap-0.5"
            >
              <span>{seat.position?.name ?? seat.positionId}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {getStructureSeatCoverageLabel(seat, tStructure)}
              </span>
            </Label>
          </div>
        );
      })}
    </div>
  );
};

export function InviteForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { handleInvitations, loading } = useUsersInvite();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });
  const currentUser = useAtomValue(currentUserState);

  const schema = useMemo(() => getInviteFormSchema(t), [t]);
  const form = useForm<TInviteForm>({
    resolver: zodResolver(schema),
    defaultValues: { emails: [], seatIds: [] },
  });

  const [emails, entityId] = form.watch(['emails', 'entityId']);
  const emailError = error || form.formState.errors.emails?.message;
  const placementRequired = !currentUser?.isOwner;

  const addTag = (value: string) => {
    const normalizedValue = normalizeEmail(value);

    if (!normalizedValue) return true;

    if (!emailSchema.safeParse(normalizedValue).success) {
      setError(t('invalid-email'));
      return false;
    }

    if (emails.includes(normalizedValue)) {
      setError(t('email-already-added'));
      return false;
    }

    form.setValue('emails', [...emails, normalizedValue], {
      shouldValidate: !!form.formState.errors.emails,
    });
    setInputValue('');
    setError('');
    return true;
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue(
      'emails',
      emails.filter((tag) => tag !== tagToRemove),
    );
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

  const submit = form.handleSubmit((values) => {
    handleInvitations({
      variables: { entries: buildInvitationEntries(values) },
      onCompleted() {
        toast({
          title: t('invitation-sent'),
          variant: 'success',
        });
        setIsOpen(false);
      },
      onError(e: ApolloError) {
        toast({
          title: t('failed-to-send-invitation'),
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();

          if (addTag(inputValue)) {
            submit();
          }
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <Input
              name="email"
              placeholder={t('enter-email-addresses')}
              value={inputValue}
              autoFocus
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={cn(
                emailError && 'focus-visible:shadow-focus-destructive',
              )}
            />
            {emailError ? (
              <p className="text-sm text-destructive mt-1.5">{emailError}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1.5">
                {t('separate-emails')}
              </p>
            )}
          </div>
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1.5 pr-1.5 max-w-full"
                >
                  <TextOverflowTooltip value={tag} className="truncate" />
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
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
        <Form.Field
          control={form.control}
          name="entityId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('structure-node')}
                {placementRequired && (
                  <span className="text-destructive"> *</span>
                )}
              </Form.Label>
              <SelectStructureEntities.FormItem
                mode="single"
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(single(value));
                  form.setValue('seatIds', []);
                }}
              />
              <Form.Description>
                {placementRequired
                  ? t('placement-required-hint')
                  : t('placement-hint')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        {entityId && (
          <Form.Field
            control={form.control}
            name="seatIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('seats')}</Form.Label>
                <InviteSeatsField
                  entityId={entityId}
                  value={field.value}
                  onValueChange={field.onChange}
                />
                <Form.Description>{t('seats-hint')}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
        <div className="w-full flex gap-3 justify-end">
          <Button type="submit" disabled={loading} className="text-sm">
            {loading ? (
              <Spinner size={'sm'} className="stroke-white" />
            ) : (
              <IconSend size={16} />
            )}
            {t('send-invites')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
