import { ButtonLink } from '@/modules/ui/Button';
import { Icon } from '@/modules/ui/Icon';

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon name="alert" size={26} />
      </span>
      <h1 className="text-2xl font-semibold text-ink">Хуудас олдсонгүй</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Таны хайсан хуудас устсан эсвэл хаяг нь өөрчлөгдсөн байж магадгүй.
        Мэдлэгийн сангаас хайх эсвэл дэмжлэгийн багт хандана уу.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Нүүр хуудас</ButtonLink>
        <ButtonLink href="/tickets/new" variant="secondary">
          Хүсэлт илгээх
        </ButtonLink>
      </div>
    </div>
  );
}
