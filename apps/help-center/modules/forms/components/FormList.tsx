import Link from 'next/link';
import { CardReveal } from '@/modules/ui/components/CardReveal';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { formTitle, type FormSummary } from '../types';

const COLUMNS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

export const FormList = ({ forms }: { forms: FormSummary[] }) => (
  <div
    className={cn(
      'grid gap-4',
      COLUMNS[Math.min(forms.length, 3)] ?? COLUMNS[3],
    )}
  >
    {forms.map((form, index) => (
      <CardReveal key={form._id} index={index}>
        <article className="group relative h-full rounded-2xl border border-line bg-white p-6 pr-20 shadow-card transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
          <h3 className="text-base font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-brand">
            <Link
              href={`/forms/${form._id}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:text-brand"
            >
              {formTitle(form)}
            </Link>
          </h3>

          {form.description?.trim() ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {form.description}
            </p>
          ) : null}

          <span
            aria-hidden="true"
            className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-white text-muted-foreground shadow-card transition-[background-color,color,transform] duration-300 ease-out group-hover:translate-x-0.5 group-hover:bg-brand group-hover:text-white"
          >
            <Icon name="chevronRight" size={17} />
          </span>
        </article>
      </CardReveal>
    ))}
  </div>
);
