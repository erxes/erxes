import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
} from '@/modules/tickets/constants/guard';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { buttonClass } from '@/modules/ui/components/Button';
import { CardLink, cardLinkClass } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

export const metadata = { title: 'Дэмжлэгийн портал' };

export default async function TicketsPage() {
  const { headline } = await getPortalIdentity();

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[{ label: 'Мэдлэгийн сан', href: '/' }, { label: 'Дэмжлэг' }]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Дэмжлэгийн портал
        </h1>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SessionLink
            href={NEW_TICKET_ROUTE}
            reason={NEW_TICKET_REASON}
            className={cardLinkClass('flex items-start gap-4 p-6')}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon name="inbox" size={22} />
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">
                Хүсэлт илгээх
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                Дэмжлэгийн багт шинэ хүсэлт үүсгэх маягтыг бөглөнө үү.
              </span>
            </span>
          </SessionLink>

          <CardLink
            href="/tickets/track"
            className="flex items-start gap-4 p-6"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon name="binoculars" size={22} />
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">
                Хүсэлт хянах
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                Хүсэлтийн дугаараа ашиглан төлөв, хариуг шалгана уу.
              </span>
            </span>
          </CardLink>
        </div>

        <section aria-labelledby="my-tickets" className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="my-tickets" className="text-xl font-semibold text-ink">
              Миний хүсэлтүүд
            </h2>
            <SessionLink
              href={NEW_TICKET_ROUTE}
              reason={NEW_TICKET_REASON}
              className={buttonClass({ size: 'sm' })}
            >
              <Icon name="plus" size={16} />
              Шинэ хүсэлт
            </SessionLink>
          </div>

          <div className="mt-5">
            <MyTickets />
          </div>
        </section>
      </Container>
    </>
  );
}
