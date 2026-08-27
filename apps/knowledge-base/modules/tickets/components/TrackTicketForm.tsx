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
import { TICKET_PORTAL_LIST } from '../graphql/queries/tickets';
import type { Ticket } from '../types';
import { TicketListItem } from './TicketListItem';

type ListResponse = { cpGetTickets: Ticket[] | null };

const trackFormSchema = z.object({
  ticketNumber: z.string().refine((value) => value.trim().length > 0, {
    message: 'Хүсэлтийн дугаарыг оруулна уу.',
  }),
});

type TrackFormValues = z.infer<typeof trackFormSchema>;

export const TrackTicketForm = () => {
  const [runSearch, { data, loading, error: queryError, called }] =
    useLazyQuery<ListResponse>(TICKET_PORTAL_LIST, {
      fetchPolicy: 'network-only',
    });

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
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
          className="rounded-xl border border-line bg-white p-5 sm:p-6"
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
                  Хүсэлтийн дугаар
                </Form.Label>
                <Form.Control>
                  <TextInput {...field} placeholder="Жишээ: 1042" />
                </Form.Control>
                <Form.Description>
                  Хүсэлт үүсгэхэд олгогдсон дугаараа оруулна уу.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="mt-5">
            <Button type="submit" disabled={loading}>
              <Icon name="binoculars" size={15} />
              {loading ? 'Хайж байна…' : 'Хүсэлт хайх'}
            </Button>
          </div>
        </form>
      </Form>

      {queryError ? (
        <LoadError
          title="Хүсэлтийг татаж чадсангүй"
          message={queryError.message}
        />
      ) : loading ? (
        <Card className="p-5">
          <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
          <span className="mt-3 block h-4 w-full animate-pulse rounded bg-subtle" />
        </Card>
      ) : called ? (
        results.length ? (
          <Card className="p-2">
            <ul className="divide-y divide-line">
              {results.map((ticket) => (
                <TicketListItem key={ticket._id} ticket={ticket} />
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon="binoculars"
            title="Хүсэлт олдсонгүй"
            description="Энэ дугаартай хүсэлт олдсонгүй. Дугаараа шалгаад дахин оролдоно уу."
          />
        )
      ) : null}
    </div>
  );
};
