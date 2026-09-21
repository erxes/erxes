import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { formTitle, type FormSummary } from '../types';

export const FormList = ({ forms }: { forms: FormSummary[] }) => (
  <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
    {forms.map((form) => (
      <li key={form._id}>
        <Link
          href={`/forms/${form._id}`}
          className="group flex items-center gap-4 px-5 py-4 outline-none transition-colors duration-200 hover:bg-subtle/70 focus-visible:bg-subtle"
        >
          <Icon
            name="clipboard"
            size={18}
            className="shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-brand"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-medium text-ink">
              {formTitle(form)}
            </span>
            {form.description?.trim() ? (
              <span className="mt-0.5 line-clamp-1 block text-[13px] text-muted-foreground">
                {form.description}
              </span>
            ) : null}
          </span>
          <span className="hidden shrink-0 items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors duration-200 group-hover:text-brand sm:flex">
            Fill in
            <Icon
              name="chevronRight"
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
          <Icon
            name="chevronRight"
            size={16}
            className="shrink-0 text-muted-foreground sm:hidden"
          />
        </Link>
      </li>
    ))}
  </ul>
);
