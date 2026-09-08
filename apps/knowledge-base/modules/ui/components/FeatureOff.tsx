import { ButtonLink } from './Button';
import { Icon } from './Icon';

/**
 * Shown where a route belongs to a feature the help center turned off. The
 * route still exists — a stale link or a bookmark reaches it — so it explains
 * itself and offers the way back rather than 404ing.
 */
export const FeatureOff = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-line bg-white p-7 text-center">
    <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-subtle text-muted-foreground">
      <Icon name="lock" size={22} />
    </span>
    <h2 className="text-lg font-semibold text-ink">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
      {description}
    </p>
    <div className="mt-5">
      <ButtonLink href="/">Нүүр хуудас руу буцах</ButtonLink>
    </div>
  </div>
);
