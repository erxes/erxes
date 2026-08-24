'use client';

import { useLazyQuery } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/modules/ui/Button';
import { EmptyState } from '@/modules/ui/EmptyState';
import { Field, TextInput } from '@/modules/ui/Field';
import { Icon } from '@/modules/ui/Icon';
import { LoadError } from '@/modules/ui/PortalState';
import { TICKET_PORTAL_LIST } from '../graphql/queries/tickets';
import type { Ticket } from '../types';
import { TicketListItem } from './TicketListItem';

type ListResponse = { cpGetTickets: Ticket[] | null };

export const TrackTicketForm = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState<string | undefined>();

  const [runSearch, { data, loading, error: queryError, called }] =
    useLazyQuery<ListResponse>(TICKET_PORTAL_LIST, {
      fetchPolicy: 'network-only',
    });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const term = ticketNumber.trim();

    if (!term) {
      setError('Хүсэлтийн дугаарыг оруулна уу.');
      return;
    }

    setError(undefined);
    void runSearch({
      variables: { filter: { searchValue: term, perPage: 10 } },
    });
  };

  const results = data?.cpGetTickets ?? [];

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-line bg-white p-6 sm:p-8"
      >
        <Field
          label="Хүсэлтийн дугаар"
          htmlFor="ticket-number"
          required
          error={error}
          hint="Хүсэлт үүсгэхэд олгогдсон дугаараа оруулна уу."
        >
          <TextInput
            id="ticket-number"
            value={ticketNumber}
            invalid={Boolean(error)}
            onChange={(event) => {
              setTicketNumber(event.target.value);
              setError(undefined);
            }}
            placeholder="Жишээ: 1042"
          />
        </Field>

        <div className="mt-6">
          <Button type="submit" disabled={loading}>
            <Icon name="binoculars" size={16} />
            {loading ? 'Хайж байна…' : 'Хүсэлт хайх'}
          </Button>
        </div>
      </form>

      {queryError ? (
        <LoadError
          title="Хүсэлтийг татаж чадсангүй"
          message={queryError.message}
        />
      ) : loading ? (
        <div className="rounded-xl border border-line bg-white p-6">
          <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
          <span className="mt-3 block h-4 w-full animate-pulse rounded bg-subtle" />
        </div>
      ) : called ? (
        results.length ? (
          <div className="rounded-xl border border-line bg-white p-2">
            <ul className="divide-y divide-line">
              {results.map((ticket) => (
                <TicketListItem key={ticket._id} ticket={ticket} />
              ))}
            </ul>
          </div>
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
