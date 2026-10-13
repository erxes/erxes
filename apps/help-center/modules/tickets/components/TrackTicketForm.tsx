'use client';

import { useLazyQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { TextInput } from '@/modules/ui/components/FormInput';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError } from '@/modules/ui/components/PortalState';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import type { Translate } from '@/modules/i18n/translate';
import { TICKET_PORTAL_LIST } from '../graphql/queries/tickets';
import type { Ticket } from '../types';
import { TicketListItem } from './TicketListItem';

type ListResponse = { cpGetTickets: Ticket[] | null };

const trackFormSchema = (t: Translate) =>
  z.object({
    ticketNumber: z.string().refine((value) => value.trim().length > 0, {
      message: t('validation.ticketNumber'),
    }),
  });

type TrackFormValues = z.infer<ReturnType<typeof trackFormSchema>>;

export const TrackTicketForm = () => {
  const t = useT();
  const [runSearch, { data, loading, error: queryError, called }] =
    useLazyQuery<ListResponse>(TICKET_PORTAL_LIST, {
      fetchPolicy: 'network-only',
    });

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema(t)),
    defaultValues: { ticketNumber: '' },
  });

  const onSubmit = ({ ticketNumber }: TrackFormValues) => {
    void runSearch({
      variables: { filter: { searchValue: ticketNumber.trim(), perPage: 10 } },
    });
  };

  const results = data?.cpGetTickets ?? [];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="rounded-2xl bg-white shadow-shell p-5 sm:p-6"
        >
          <Form.Field
            control={form.control}
            name="ticketNumber"
            render={({ field }) => (
              <Form.Item>
                <Form.Label
                  className="text-[13px] font-medium text-ink"
                  variant="peer"
                >
                  {t('tickets.number')}
                </Form.Label>
                <Form.Control>
                  <TextInput
                    {...field}
                    placeholder={t('tickets.numberPlaceholder')}
                  />
                </Form.Control>
                <Form.Description>{t('tickets.numberHint')}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="mt-5">
            <Button type="submit" disabled={loading}>
              <Icon name="binoculars" size={15} />
              {loading ? t('common.searching') : t('tickets.find')}
            </Button>
          </div>
        </form>
      </Form>

      {queryError ? (
        <LoadError
          title={t('tickets.loadOneFailed')}
          message={queryError.message}
        />
      ) : loading ? (
        <Card className="p-5">
          <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
          <span className="mt-3 block h-4 w-full animate-pulse rounded bg-subtle" />
        </Card>
      ) : called ? (
        results.length ? (
          <ul className="flex flex-col gap-2.5">
            {results.map((ticket) => (
              <TicketListItem key={ticket._id} ticket={ticket} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="binoculars"
            title={t('tickets.notFound')}
            description={t('tickets.notFoundText')}
          />
        )
      ) : null}
    </div>
  );
};
