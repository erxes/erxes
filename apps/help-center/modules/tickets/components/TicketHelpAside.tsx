import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { Spotlight } from '@/modules/ui/components/Spotlight';

export type TicketSuggestion = {
  _id: string;
  title: string;
};

const TIPS = [
  'Quote the error message word for word, if there was one.',
  'Say when it started and whether it still happens.',
  'Add a link or screenshot of the screen you were on.',
];

export const TicketHelpAside = ({
  suggestions,
}: {
  suggestions: TicketSuggestion[];
}) => (
  <aside className="space-y-4 lg:sticky lg:top-6">
    <Spotlight className="rounded-2xl bg-white p-5 shadow-shell transition-shadow duration-500 ease-out-soft hover:shadow-shell-hover">
      <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon name="bulb" size={15} className="text-brand" />
        Before you submit
      </h2>

      <ul className="mt-4 space-y-3">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2.5 text-[13px] leading-relaxed">
            <Icon
              name="check"
              size={14}
              className="mt-[3px] shrink-0 text-brand"
            />
            <span className="text-ink-soft">{tip}</span>
          </li>
        ))}
      </ul>
    </Spotlight>

    {suggestions.length ? (
      <Spotlight className="rounded-2xl bg-white p-5 shadow-shell transition-shadow duration-500 ease-out-soft hover:shadow-shell-hover">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <Icon name="book" size={15} className="text-brand" />
          Maybe already answered
        </h2>

        <ul className="mt-3 flex flex-col">
          {suggestions.map((article) => (
            <li key={article._id}>
              <Link
                href={`/knowledge-base/article/${article._id}`}
                className="group -mx-2.5 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[13px] leading-relaxed text-ink-soft outline-none transition-colors duration-200 hover:bg-brand-soft/60 hover:text-brand focus-visible:bg-brand-soft/60 focus-visible:text-brand"
              >
                <span className="min-w-0 flex-1">{article.title}</span>
                <Icon
                  name="chevronRight"
                  size={14}
                  className="mt-0.5 shrink-0 text-muted-foreground/40 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Spotlight>
    ) : null}

    <p className="px-1 text-[13px] leading-relaxed text-muted-foreground">
      Already have a ticket number?{' '}
      <Link
        href="/tickets/track"
        className="font-semibold text-brand underline-offset-2 outline-none transition-colors hover:text-brand-strong hover:underline focus-visible:underline"
      >
        Track it here
      </Link>
      .
    </p>
  </aside>
);
