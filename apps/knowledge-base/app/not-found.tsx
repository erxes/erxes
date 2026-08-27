import { SiteShell } from '@/modules/layout/components/SiteShell';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

export default function NotFound() {
  return (
    <SiteShell>
      <Container
        width="text"
        className="flex flex-col items-center py-24 text-center"
      >
        <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon name="alert" size={26} />
        </span>
        <h1 className="text-2xl font-semibold text-ink">Хуудас олдсонгүй</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Таны хайсан хуудас устсан эсвэл хаяг нь өөрчлөгдсөн байж магадгүй.
          Мэдлэгийн сангаас хайх эсвэл дэмжлэгийн багт хандана уу.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Нүүр хуудас</ButtonLink>
          <ButtonLink href="/tickets/new" variant="secondary">
            Хүсэлт илгээх
          </ButtonLink>
        </div>
      </Container>
    </SiteShell>
  );
}
