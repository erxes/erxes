'use client';

import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { AUTH_PORTAL_CUSTOMER_EDIT } from '@/modules/auth/graphql/mutations/auth';
import type { CustomerEditResponse } from '@/modules/auth/types';
import { TextareaInput, TextInput } from '@/modules/ui/components/FormInput';
import { Icon } from '@/modules/ui/components/Icon';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { SetupNotice } from '@/modules/ui/components/PortalState';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import type { Translate } from '@/modules/i18n/translate';
import { contactErrorMessage } from '../utils/errors';
import { TICKET_PORTAL_CREATE } from '../graphql/mutations/tickets';

const SUBJECT_MAX = 120;
const DESCRIPTION_MAX = 4000;

const PHONE_MIN_DIGITS = 8;

const digitsOf = (value: string) => value.replace(/\D/g, '');

const ticketFormSchema = (t: Translate) =>
  z.object({
    subject: z
      .string()
      .max(SUBJECT_MAX)
      .refine((value) => value.trim().length >= 5, {
        message: t('validation.titleMin'),
      }),
    description: z
      .string()
      .max(DESCRIPTION_MAX)
      .refine((value) => value.trim().length >= 20, {
        message: t('validation.descriptionMin'),
      }),
    contactName: z.string().refine((value) => value.trim().length >= 2, {
      message: t('validation.name'),
    }),
    contactEmail: z.string().email(t('validation.emailRequired')),
    contactPhone: z
      .string()
      .refine((value) => value.trim().length > 0, {
        message: t('validation.phoneRequired'),
      })
      .refine((value) => digitsOf(value).length >= PHONE_MIN_DIGITS, {
        message: t('validation.phoneDigits', { count: PHONE_MIN_DIGITS }),
      }),
  });

type TicketFormValues = z.infer<ReturnType<typeof ticketFormSchema>>;

type CreatedTicket = {
  cpCreateTicket: {
    _id: string;
    number: string | null;
    name: string | null;
  } | null;
};

export type TicketTarget = {
  channelId: string;
  pipelineId: string;
  statusId: string;
};

const missingTargetKeys = (target: TicketTarget): string[] =>
  [
    !target.channelId && 'ticket channel',
    !target.pipelineId && 'ticket pipeline',
    !target.statusId && 'ticket status',
  ].filter((key): key is string => !!key);

export const TicketForm = ({ target }: { target: TicketTarget }) => {
  const ticketEnv = target;
  const missing = missingTargetKeys(target);
  const { user, updateUser } = useSession();
  const t = useT();

  const [editCustomer] = useMutation<CustomerEditResponse>(
    AUTH_PORTAL_CUSTOMER_EDIT,
  );

  const [createTicket, { data, loading, error, reset }] =
    useMutation<CreatedTicket>(TICKET_PORTAL_CREATE, {
      refetchQueries: ['notificationPortalList'],
      update: (cache) => {
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'cpGetTickets' });
        cache.gc();
      },
    });

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema(t)),
    defaultValues: {
      subject: '',
      description: '',
      contactName: user?.name ?? '',
      contactEmail: user?.email ?? '',
      contactPhone: user?.phone ?? '',
    },
  });

  if (missing.length) {
    return <SetupNotice missing={missing} />;
  }

  const created = data?.cpCreateTicket;

  const syncContact = async (
    values: TicketFormValues,
  ): Promise<string | null> => {
    const name = values.contactName.trim();
    const phone = values.contactPhone.trim();
    const [firstName, ...rest] = name.split(/\s+/);
    const lastName = rest.join(' ');

    try {
      const { data } = await editCustomer({
        variables: {
          firstName,
          ...(lastName ? { lastName } : {}),
          primaryPhone: phone,
        },
      });

      if (!data?.clientPortalCustomerEdit) {
        return t('tickets.noCustomer');
      }

      updateUser({ name, phone });
      return null;
    } catch (caught) {
      return contactErrorMessage(caught, t);
    }
  };

  const onSubmit = async (values: TicketFormValues) => {
    const contactError = await syncContact(values);

    const submitted = await createTicket({
      variables: {
        name: values.subject.trim(),
        description: values.description.trim(),
        pipelineId: ticketEnv.pipelineId,
        channelId: ticketEnv.channelId,
        statusId: ticketEnv.statusId,
      },
    }).catch(() => null);

    if (submitted?.data && contactError) {
      toast({
        variant: 'warning',
        title: t('tickets.contactNotSaved'),
        description: t('tickets.contactNotSavedText', { reason: contactError }),
      });
    }
  };

  if (created) {
    const [submittedBefore, submittedAfter] = t('tickets.submittedText').split(
      '{number}',
    );

    return (
      <Card className="p-7 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Icon name="check" size={22} />
        </span>
        <h2 className="text-lg font-semibold text-ink">
          {t('tickets.submitted')}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {submittedBefore}
          <span className="font-semibold text-ink">
            {created.number ?? created._id}
          </span>
          {submittedAfter}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={`/tickets/${created._id}`}>
            {t('tickets.openYours')}
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              form.reset({
                ...form.getValues(),
                subject: '',
                description: '',
              });
              reset();
            }}
          >
            {t('tickets.submitAnother')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="overflow-hidden rounded-2xl bg-white shadow-shell"
      >
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-base font-semibold text-ink">
            {t('tickets.details')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('tickets.detailsHint')}
          </p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <Form.Field
            control={form.control}
            name="subject"
            render={({ field }) => (
              <Form.Item>
                <div className="flex items-baseline justify-between gap-3">
                  <Form.Label
                    className="text-[13px] font-medium text-ink"
                    variant="peer"
                  >
                    {t('field.title')}
                  </Form.Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {field.value.length}/{SUBJECT_MAX}
                  </span>
                </div>
                <Form.Control>
                  <TextInput
                    {...field}
                    maxLength={SUBJECT_MAX}
                    placeholder={t('field.titlePlaceholder')}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <div className="flex items-baseline justify-between gap-3">
                  <Form.Label
                    className="text-[13px] font-medium text-ink"
                    variant="peer"
                  >
                    {t('field.description')}
                  </Form.Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {field.value.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
                <Form.Control>
                  <TextareaInput
                    {...field}
                    rows={5}
                    maxLength={DESCRIPTION_MAX}
                    placeholder={t('field.descriptionPlaceholder')}
                  />
                </Form.Control>
                <Form.Description>
                  {t('field.descriptionHint')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="border-t border-line pt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {t('tickets.contact')}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t('tickets.contactHint')}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Form.Field
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      {t('field.name')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="name"
                        placeholder={t('field.namePlaceholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      {t('field.phone')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        placeholder="99112233"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <Form.Item className="sm:col-span-2">
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      {t('field.email')}
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="email"
                        readOnly
                        aria-readonly
                        className="cursor-not-allowed text-muted-foreground"
                      />
                    </Form.Control>
                    <Form.Description>
                      {t('tickets.emailHint')}
                    </Form.Description>
                  </Form.Item>
                )}
              />
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
            >
              <Icon name="alert" size={15} className="mt-px shrink-0" />
              Something went wrong submitting your ticket: {error.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-subtle px-6 py-4">
          <ButtonLink href="/tickets" variant="ghost">
            {t('common.cancel')}
          </ButtonLink>
          <Button type="submit" disabled={loading}>
            <Icon name="send" size={15} />
            {loading ? t('tickets.submitting') : t('tickets.submitButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
