'use client';

import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  missingTicketEnvKeys,
  readTicketEnv,
} from '@/modules/apollo/utils/env';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { TextareaInput, TextInput } from '@/modules/ui/components/FormInput';
import { Icon } from '@/modules/ui/components/Icon';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { SetupNotice } from '@/modules/ui/components/PortalState';
import { buildTicketBody } from '../utils/format';
import { TICKET_PORTAL_CREATE } from '../graphql/mutations/tickets';

const SUBJECT_MAX = 120;
const DESCRIPTION_MAX = 4000;

const ticketFormSchema = z.object({
  subject: z
    .string()
    .max(SUBJECT_MAX)
    .refine((value) => value.trim().length >= 5, {
      message: 'Гарчиг дор хаяж 5 тэмдэгт байна.',
    }),
  description: z
    .string()
    .max(DESCRIPTION_MAX)
    .refine((value) => value.trim().length >= 20, {
      message: 'Асуудлаа дор хаяж 20 тэмдэгтээр тайлбарлана уу.',
    }),
  contactName: z.string().refine((value) => value.trim().length >= 2, {
    message: 'Нэрээ бичнэ үү.',
  }),
  contactEmail: z.string().email('Зөв и-мэйл хаяг бичнэ үү.'),
  contactPhone: z.string(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

type CreatedTicket = {
  cpCreateTicket: {
    _id: string;
    number: string | null;
    name: string | null;
  } | null;
};

const buildDescription = (values: TicketFormValues): string =>
  buildTicketBody(
    values.description.trim(),
    [
      values.contactName.trim(),
      values.contactEmail.trim(),
      values.contactPhone.trim(),
    ]
      .filter(Boolean)
      .join(' · '),
  );

export const TicketForm = () => {
  const ticketEnv = readTicketEnv();
  const missing = missingTicketEnvKeys(ticketEnv);
  const { user } = useSession();

  const [createTicket, { data, loading, error, reset }] =
    useMutation<CreatedTicket>(TICKET_PORTAL_CREATE, {
      /*
       * `MyTickets` reads `cpGetTickets` cache-first on another route, so the
       * cached list is dropped here — otherwise a freshly created ticket is
       * missing from it until a hard reload.
       */
      update: (cache) => {
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'cpGetTickets' });
        cache.gc();
      },
    });

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    form.reset(
      { ...form.getValues(), contactName: user.name, contactEmail: user.email },
      { keepDirtyValues: true },
    );
  }, [user, form]);

  if (missing.length) {
    return <SetupNotice missing={missing} />;
  }

  const created = data?.cpCreateTicket;

  const onSubmit = async (values: TicketFormValues) => {
    await createTicket({
      variables: {
        name: values.subject.trim(),
        description: buildDescription(values),
        pipelineId: ticketEnv.pipelineId,
        channelId: ticketEnv.channelId,
        statusId: ticketEnv.statusId,
      },
    }).catch(() => null);
  };

  if (created) {
    return (
      <Card className="p-7 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Icon name="check" size={22} />
        </span>
        <h2 className="text-lg font-semibold text-ink">
          Хүсэлт амжилттай илгээгдлээ
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Таны хүсэлтийн дугаар{' '}
          <span className="font-semibold text-ink">
            {created.number ?? created._id}
          </span>
          . Явцыг энэ дугаараар хянах боломжтой.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={`/tickets/${created._id}`}>
            Хүсэлтээ нээх
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
            Өөр хүсэлт илгээх
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
        className="overflow-hidden rounded-xl border border-line bg-white"
      >
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">
            Хүсэлтийн мэдээлэл
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Тодорхой бичих тусам хурдан шийдэгдэнэ.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5">
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
                    Гарчиг
                  </Form.Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {field.value.length}/{SUBJECT_MAX}
                  </span>
                </div>
                <Form.Control>
                  <TextInput
                    {...field}
                    maxLength={SUBJECT_MAX}
                    placeholder="Асуудлаа нэг өгүүлбэрээр бичнэ үү"
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
                    Дэлгэрэнгүй
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
                    placeholder="Асуудлын дэлгэрэнгүй тайлбар"
                  />
                </Form.Control>
                <Form.Description>
                  Юу тохиолдсон, хэзээ эхэлсэн, ямар алхмаар давтагддагийг бичнэ
                  үү.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="border-t border-line pt-5">
            <h3 className="text-sm font-semibold text-ink">Холбоо барих</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {user
                ? 'Нэвтэрсэн хаягаар урьдчилан бөглөгдсөн. Шаардлагатай бол засна уу.'
                : 'Хариуг энэ хаягаар илгээнэ.'}
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
                      Нэр
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        autoComplete="name"
                        placeholder="Таны нэр"
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
                  <Form.Item>
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      И-мэйл
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
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
                      Утас
                    </Form.Label>
                    <Form.Control>
                      <TextInput
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        placeholder="99112233"
                      />
                    </Form.Control>
                    <Form.Description>Заавал биш.</Form.Description>
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
              Хүсэлт илгээхэд алдаа гарлаа: {error.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-subtle px-5 py-3.5">
          <ButtonLink href="/tickets" variant="ghost">
            Болих
          </ButtonLink>
          <Button type="submit" disabled={loading}>
            <Icon name="send" size={15} />
            {loading ? 'Илгээж байна…' : 'Хүсэлт илгээх'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
