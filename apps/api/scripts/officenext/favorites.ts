/**
 * `favorites` → `core_favorites`: a member's starred page comes in when its address is a core
 * page the new web app still has. Old plugin pages (`/operation/team/…`, `/sales/deals?…`) have
 * other addresses in the new plugins, so a star on one would open nothing; those are skipped with
 * the plugin's name. The label is the old one, else the breadcrumb, and the order is by when the
 * member starred it.
 */
import { resolve } from './idMap';
import { idSet, insert, readAll, type Run, unit } from './run';
import { createdOf, field, optionalId, readOr, record, text, when } from './values';

const Favorite = record({
  path: text,
  label: text,
  userId: optionalId,
  breadcrumb: field((value) =>
    Array.isArray(value) ? value.filter((part) => typeof part === 'string') : [],
  ),
  createdAt: when,
});

type Favorite = NonNullable<ReturnType<typeof Favorite.parse>>;

/** Core pages whose address didn't change. */
const CORE_PAGES = new Set([
  '/contacts/customers',
  '/contacts/companies',
  '/contacts/leads',
  '/products',
  '/automations',
  '/broadcasts',
  '/reports',
  '/settings',
]);

/** Where the favorite goes, or why it stays out. */
export const favoriteOf = (favorite: Favorite, members: Set<string>) => {
  const user = favorite.userId && resolve('user', favorite.userId);
  const page = favorite.path?.split('?')[0] ?? '';
  const label = (favorite.label ?? favorite.breadcrumb.join(' / ')) || page;

  if (!user || !members.has(user)) return { skip: 'member not in core' };

  if (!CORE_PAGES.has(page)) {
    const app = page.split('/')[1] || '?';

    return { skip: `old ${app} page: the new app has other addresses` };
  }

  return { user, path: favorite.path ?? page, label: label.slice(0, 120) };
};

/** Every member's starred core pages. */
export const importFavorites = async (run: Run) => {
  const name = 'favorites';
  const members = await idSet(run, 'core_users');
  const favorites = (await readAll(run, name)).flatMap((raw) => readOr(Favorite, raw) ?? []);
  const positions = new Map<string, number>();

  run.report.of(name, 'core_favorites');
  run.report.seen(name, favorites.length);

  const rows = favorites
    .toSorted((a, b) => +createdOf(a.id, a.createdAt) - +createdOf(b.id, b.createdAt))
    .flatMap((favorite) => {
      const placed = favoriteOf(favorite, members);

      if (placed.skip !== undefined) {
        run.report.skip(name, placed.skip, favorite.id);

        return [];
      }

      const position = positions.get(placed.user) ?? 0;

      positions.set(placed.user, position + 1);

      return [
        [
          favorite.id,
          placed.user,
          placed.path,
          placed.label,
          position,
          createdOf(favorite.id, favorite.createdAt),
        ],
      ];
    });

  await unit(run, () =>
    insert(run, {
      collection: name,
      table: 'core_favorites',
      columns: ['id', 'user_id', 'path', 'label', 'position', 'created_at'],
      rows,
      keys: rows.map((row) => String(row[0])),
    }),
  );
};
