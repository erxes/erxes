'use client';

import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { missingTicketEnvKeys, readTicketEnv } from '@/modules/apollo/env';
import { Button, ButtonLink } from '@/modules/ui/Button';
import { Field, Select, TextArea, TextInput } from '@/modules/ui/Field';
import { Icon } from '@/modules/ui/Icon';
import { SetupNotice } from '@/modules/ui/PortalState';
import { TICKET_PORTAL_CREATE } from '../graphql/mutations/tickets';
import { priorityLabels, ticketPriorities } from '../types';

type FormValues = {
  subject: string;
  description: string;
  priority: number;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type CreatedTicket = {
  cpCreateTicket: { _id: string; number: string | null; name: string | null } | null;
};

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  if (values.subject.trim().length < 5) {
    errors.subject = 'Гарчиг дор хаяж 5 тэмдэгт байна.';
  }

  if (values.description.trim().length < 20) {
    errors.description = 'Асуудлаа дор хаяж 20 тэмдэгтээр тайлбарлана уу.';
  }

  return errors;
};

export const TicketForm = () => {
  const ticketEnv = readTicketEnv();
  const missing = missingTicketEnvKeys(ticketEnv);

  const [values, setValues] = useState<FormValues>({
    subject: '',
    description: '',
    priority: 2,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [created, setCreated] = useState<{ _id: string; number: string } | null>(
    null,
  );

  const [createTicket, { loading, error }] =
    useMutation<CreatedTicket>(TICKET_PORTAL_CREATE);

  if (missing.length) {
    return <SetupNotice missing={missing} />;
  }

  const update = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const result = await createTicket({
      variables: {
        name: values.subject.trim(),
        description: values.description.trim(),
        priority: values.priority,
        pipelineId: ticketEnv.pipelineId,
        channelId: ticketEnv.channelId,
        statusId: ticketEnv.statusId,
      },
    }).catch(() => null);

    const ticket = result?.data?.cpCreateTicket;

    if (ticket) {
      setCreated({ _id: ticket._id, number: ticket.number ?? ticket._id });
    }
  };

  if (created) {
    return (
      <div className="rounded-xl border border-line bg-white p-8 text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Icon name="check" size={26} />
        </span>
        <h2 className="text-xl font-semibold text-ink">
          Хүсэлт амжилттай илгээгдлээ
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Таны хүсэлтийн дугаар{' '}
          <span className="font-semibold text-ink">{created.number}</span>. Явцыг
          энэ дугаараар хянах боломжтой.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={`/tickets/${created._id}`}>
            Хүсэлтээ нээх
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setCreated(null);
              setValues({ subject: '', description: '', priority: 2 });
            }}
          >
            Өөр хүсэлт илгээх
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-line bg-white p-6 sm:p-8"
    >
      <div className="space-y-5">
        <Field label="Гарчиг" htmlFor="subject" required error={errors.subject}>
          <TextInput
            id="subject"
            value={values.subject}
            invalid={Boolean(errors.subject)}
            onChange={(event) => update('subject', event.target.value)}
            placeholder="Асуудлаа нэг өгүүлбэрээр бичнэ үү"
          />
        </Field>

        <Field
          label="Чухлын зэрэг"
          htmlFor="priority"
          hint="Яаралтай хүсэлтэд хамгийн түрүүнд хариу өгнө."
        >
          <div className="relative">
            <Select
              id="priority"
              value={String(values.priority)}
              onChange={(event) =>
                update('priority', Number(event.target.value))
              }
            >
              {ticketPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </Select>
            <Icon
              name="chevronDown"
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </Field>

        <Field
          label="Дэлгэрэнгүй"
          htmlFor="description"
          required
          error={errors.description}
          hint="Юу тохиолдсон, хэзээ эхэлсэн, ямар алхмаар давтагддагийг бичнэ үү."
        >
          <TextArea
            id="description"
            value={values.description}
            invalid={Boolean(errors.description)}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Асуудлын дэлгэрэнгүй тайлбар"
          />
        </Field>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg bg-danger-soft px-4 py-3 text-[13px] text-danger"
        >
          <Icon name="alert" size={15} className="mt-px shrink-0" />
          Хүсэлт илгээхэд алдаа гарлаа: {error.message}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
        <Link
          href="/tickets"
          className="text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          Болих
        </Link>
        <Button type="submit" disabled={loading}>
          <Icon name="send" size={16} />
          {loading ? 'Илгээж байна…' : 'Хүсэлт илгээх'}
        </Button>
      </div>
    </form>
  );
};
