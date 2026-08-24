import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/Button';
import { CardLink } from '@/modules/ui/Card';
import { Icon } from '@/modules/ui/Icon';

export const metadata = { title: 'Дэмжлэгийн портал' };

export default async function TicketsPage() {
  const { headline } = await getPortalIdentity();

  return (
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[{ label: 'Мэдлэгийн сан', href: '/' }, { label: 'Дэмжлэг' }]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Дэмжлэгийн портал
        </h1>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <CardLink href="/tickets/new" className="flex items-start gap-4 p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon name="inbox" size={22} />
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">
                Хүсэлт илгээх
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                Дэмжлэгийн багт шинэ хүсэлт үүсгэх маягтыг бөглөнө үү.
              </span>
            </span>
          </CardLink>

          <CardLink href="/tickets/track" className="flex items-start gap-4 p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon name="binoculars" size={22} />
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">
                Хүсэлт хянах
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted">
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
            <ButtonLink href="/tickets/new" size="sm">
              <Icon name="plus" size={16} />
              Шинэ хүсэлт
            </ButtonLink>
          </div>

          <div className="mt-5">
            <MyTickets />
          </div>
        </section>
      </div>
    </>
  );
}
