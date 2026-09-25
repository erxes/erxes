import Link from 'next/link';
import { CardReveal } from '@/modules/ui/components/CardReveal';
import { Icon } from '@/modules/ui/components/Icon';
import { IconOrb } from '@/modules/ui/components/IconOrb';
import { Spotlight } from '@/modules/ui/components/Spotlight';
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
        <Spotlight
          as="article"
          className="group flex h-full items-center gap-4 rounded-2xl bg-white p-5 shadow-shell transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-shell-hover"
        >
          <IconOrb name="clipboard" size="sm" />

          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand">
              <Link
                href={`/forms/${form._id}`}
                className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:text-brand"
              >
                {formTitle(form)}
              </Link>
            </span>

            {form.description?.trim() ? (
              <span className="mt-1 block line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                {form.description}
              </span>
            ) : null}
          </span>

          <Icon
            name="chevronRight"
            size={16}
            className="shrink-0 text-muted-foreground/40 transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-1 group-hover:text-brand"
          />
        </Spotlight>
      </CardReveal>
    ))}
  </div>
);
