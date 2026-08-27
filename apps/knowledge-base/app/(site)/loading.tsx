import { Container } from '@/modules/ui/components/Container';

/** Shown while a route's server data is still in flight. */
export default function SiteLoading() {
  return (
    <Container className="py-10 lg:py-14" aria-busy>
      <span className="sr-only">Ачаалж байна…</span>
      <span className="block h-4 w-56 animate-pulse rounded bg-line" />
      <span className="mt-6 block h-8 w-80 max-w-full animate-pulse rounded bg-line" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {[0, 1].map((card) => (
          <span
            key={card}
            className="block h-28 animate-pulse rounded-xl bg-line"
          />
        ))}
      </div>

      <span className="mt-6 block h-64 animate-pulse rounded-xl bg-line" />
    </Container>
  );
}
