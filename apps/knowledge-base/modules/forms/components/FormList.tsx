import { CardLink } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { formTitle, type FormSummary } from '../types';

export const FormList = ({ forms }: { forms: FormSummary[] }) => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {forms.map((form) => (
      <li key={form._id}>
        <CardLink
          href={`/forms/${form._id}`}
          className="flex h-full items-start gap-3.5 p-4"
        >
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Icon name="clipboard" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-ink">
              {formTitle(form)}
            </span>
            {form.description?.trim() ? (
              <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-muted-foreground">
                {form.description}
              </span>
            ) : null}
          </span>
          <span className="mt-1 shrink-0 text-muted-foreground">
            <Icon name="chevronRight" size={16} />
          </span>
        </CardLink>
      </li>
    ))}
  </ul>
);
